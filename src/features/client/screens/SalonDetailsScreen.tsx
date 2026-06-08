import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { ImageSourcePropType } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { ClientStackParamList } from '@/navigation/navigation.types';
import {
  useSalonDetail,
  useSalonReviews,
  type SalonService,
  type SalonReview,
} from '@/services/api/hooks/useSalonsAPI';
import { resolveImageUrl } from '@/services/api/imageUrl';

const colors = {
  background: '#FFFAF5',
  surface: '#FFF6EC',
  surfaceStrong: '#FFF6EC',
  text: '#221A11',
  muted: '#534433',
  subtle: '#655D52',
  border: 'rgba(217, 195, 173, 0.4)',
  gold: '#F89E07',
  goldDark: '#F89E07',
  green: '#22C55E',
  greenSoft: '#22C55E',
  chip: '#F0E0D1',
  action: '#FFF1E6',
  avatar: '#E8B7A6',
  white: '#ffffff',
};

// Fallbacks used only when a salon has no remote images (exported 1:1 from Figma).
const heroFallback = require('@/assets/salon/hero.png');
const mapImg = require('@/assets/salon/map.png');

const facilities = ['Free Wifi', 'Steam Room', 'Car Parking', 'AC', 'Sanitized Tools'];

type SalonRoute = RouteProp<ClientStackParamList, 'SalonDetails'>;
type Navigation = NativeStackNavigationProp<ClientStackParamList>;
type SectionKey = 'services' | 'reviews' | 'about';

function humanizeType(type?: string | null) {
  if (!type) return 'Salon';
  return type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatTime(t?: string | null) {
  if (!t) return null;
  const [hStr, mStr] = t.split(':');
  let h = parseInt(hStr, 10);
  if (Number.isNaN(h)) return null;
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${mStr ?? '00'} ${ampm}`;
}

function isOpenNow(open?: string | null, close?: string | null, workingDays?: string[] | null) {
  if (!open || !close) return null;
  const now = new Date();
  if (workingDays && workingDays.length) {
    const today = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const days = workingDays.map((d) => d.toLowerCase());
    if (!days.some((d) => today.startsWith(d) || d.startsWith(today.slice(0, 3)))) return false;
  }
  const toMin = (t: string) => {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + (m || 0);
  };
  const cur = now.getHours() * 60 + now.getMinutes();
  return cur >= toMin(open) && cur <= toMin(close);
}

function priceText(value: number) {
  return `₹${Math.round(value)}`;
}

export function SalonDetailsScreen() {
  const navigation = useNavigation<Navigation>();
  const route = useRoute<SalonRoute>();
  const routeSalon = route.params?.salon;
  const salonId = routeSalon?.id;

  const detailQuery = useSalonDetail(salonId);
  const reviewsQuery = useSalonReviews(salonId);
  const salon = detailQuery.data?.salon;
  const services = detailQuery.data?.services ?? [];
  const reviews = reviewsQuery.data?.reviews ?? [];

  const scrollRef = useRef<ScrollView>(null);
  const [activeTab, setActiveTab] = useState<SectionKey>('services');
  const [sectionOffsets, setSectionOffsets] = useState<Record<SectionKey, number>>({
    about: 0,
    reviews: 0,
    services: 0,
  });

  const handleTabPress = (section: SectionKey) => {
    setActiveTab(section);
    scrollRef.current?.scrollTo({ animated: true, y: Math.max(sectionOffsets[section] - 12, 0) });
  };

  // Derived display values, falling back to whatever the list screen passed us.
  const name = salon?.business_name ?? routeSalon?.name ?? 'Salon';
  const coverImages = (salon?.cover_images?.filter(Boolean) ?? [])
    .map((u) => resolveImageUrl(u))
    .filter((u): u is string => !!u);
  const heroUri = coverImages[0] ?? resolveImageUrl(salon?.logo_url) ?? routeSalon?.heroImage ?? null;
  const heroSource: ImageSourcePropType = heroUri ? { uri: heroUri } : heroFallback;
  const locationText =
    [salon?.address, salon?.city, salon?.state].filter(Boolean).join(', ') ||
    routeSalon?.location ||
    'Location unavailable';
  const ratingValue =
    salon?.average_rating != null
      ? Number(salon.average_rating).toFixed(1)
      : routeSalon?.rating ?? 'New';
  const reviewCount = salon?.total_reviews ?? routeSalon?.reviewCount ?? reviews.length;

  if (detailQuery.isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          <ActivityIndicator color={colors.gold} size="large" />
        </View>
      </SafeAreaView>
    );
  }

  if (detailQuery.isError && !salon) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          <Text style={styles.errorText}>
            {(detailQuery.error as any)?.message || 'Could not load this salon.'}
          </Text>
          <Pressable onPress={() => detailQuery.refetch()} style={styles.retryBtn}>
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
          <Pressable onPress={() => navigation.goBack()}>
            <Text style={styles.backLink}>Go back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.safeArea}>
      <View style={styles.screen}>
        <ScrollView contentContainerStyle={styles.content} ref={scrollRef} showsVerticalScrollIndicator={false}>
          <SalonHero onBackPress={() => navigation.goBack()} source={heroSource} />
          {coverImages.length > 1 ? <ThumbnailGallery images={coverImages} /> : null}

          <SalonInfo name={name} category={humanizeType(salon?.salon_type)} location={locationText} rating={ratingValue} reviewCount={reviewCount} distanceKm={salon?.distance_km ?? null} />

          <OpeningPill
            openTime={salon?.opening_time}
            closeTime={salon?.closing_time}
            workingDays={salon?.working_days}
          />
          <ActionButtons />
          <DetailTabs activeTab={activeTab} onTabPress={handleTabPress} />

          <View
            onLayout={(e) => {
              const y = e.nativeEvent.layout.y;
              setSectionOffsets((p) => ({ ...p, services: y }));
            }}
          >
            <ServiceList services={services} />
          </View>

          <FacilitiesList />

          <View
            onLayout={(e) => {
              const y = e.nativeEvent.layout.y;
              setSectionOffsets((p) => ({ ...p, reviews: y }));
            }}
          >
            <ReviewsSection
              reviews={reviews}
              loading={reviewsQuery.isLoading}
              rating={ratingValue}
              count={reviewCount}
            />
          </View>

          <View
            onLayout={(e) => {
              const y = e.nativeEvent.layout.y;
              setSectionOffsets((p) => ({ ...p, about: y }));
            }}
          >
            <AboutSection name={name} description={salon?.description} />
          </View>

          <LocationCard name={name} location={locationText} />
        </ScrollView>

        <StickyBookButton onPress={() => navigation.navigate('SalonServices', { salonName: name })} />
      </View>
    </SafeAreaView>
  );
}

function SalonHero({ onBackPress, source }: { onBackPress: () => void; source: ImageSourcePropType }) {
  return (
    <View style={styles.heroWrap}>
      <Image source={source} style={styles.heroImage} />
      <View style={styles.heroOverlay} />
      <Pressable onPress={onBackPress} style={styles.heroBackButton}>
        <Ionicons color={colors.white} name="arrow-back" size={22} />
      </Pressable>
    </View>
  );
}

function ThumbnailGallery({ images }: { images: string[] }) {
  const shown = images.slice(0, 5);
  const extra = images.length - shown.length;
  return (
    <ScrollView contentContainerStyle={styles.thumbnailRow} horizontal showsHorizontalScrollIndicator={false}>
      {shown.map((uri, index) => {
        const isLast = index === shown.length - 1 && extra > 0;
        return (
          <View key={`thumb-${index}`} style={styles.thumbnailWrap}>
            <Image source={{ uri }} style={styles.thumbnail} />
            {isLast ? (
              <View style={styles.thumbnailOverlay}>
                <Text style={styles.thumbnailOverlayText}>+{extra} More</Text>
              </View>
            ) : null}
          </View>
        );
      })}
    </ScrollView>
  );
}

function SalonInfo({
  name,
  category,
  location,
  rating,
  reviewCount,
  distanceKm,
}: {
  name: string;
  category: string;
  location: string;
  rating: string;
  reviewCount: number;
  distanceKm: number | null;
}) {
  return (
    <View style={styles.sectionCard}>
      <View style={styles.infoRow}>
        <View style={styles.infoTextWrap}>
          <Text style={styles.salonName}>{name}</Text>
          <Text style={styles.salonCategory}>{category}</Text>
        </View>

        <View style={styles.infoIcons}>
          <Pressable style={styles.infoIconButton}>
            <Ionicons color={colors.goldDark} name="heart-outline" size={20} />
          </Pressable>
          <Pressable style={styles.infoIconButton}>
            <Ionicons color={colors.goldDark} name="share-social-outline" size={20} />
          </Pressable>
        </View>
      </View>

      <View style={styles.metaLine}>
        <Ionicons color={colors.goldDark} name="location-sharp" size={15} />
        <Text style={styles.metaLineText}>{location}</Text>
      </View>

      <View style={styles.metaLine}>
        <Ionicons color={colors.goldDark} name="star" size={15} />
        <Text style={styles.metaLineText}>
          {rating} ({reviewCount} {reviewCount === 1 ? 'Review' : 'Reviews'})
          {distanceKm != null ? ` • ${distanceKm.toFixed(1)} km away` : ''}
        </Text>
      </View>
    </View>
  );
}

function OpeningPill({
  openTime,
  closeTime,
  workingDays,
}: {
  openTime?: string | null;
  closeTime?: string | null;
  workingDays?: string[] | null;
}) {
  const open = formatTime(openTime);
  const close = formatTime(closeTime);
  const openNow = isOpenNow(openTime, closeTime, workingDays);

  if (!open || !close) {
    return (
      <View style={styles.openingPill}>
        <Text style={styles.openingText}>Opening hours not available</Text>
      </View>
    );
  }

  return (
    <View style={styles.openingPill}>
      <View style={styles.openingLeft}>
        <View style={[styles.openingCheck, openNow === false && styles.openingClosed]}>
          <Ionicons color={colors.white} name={openNow === false ? 'close' : 'checkmark'} size={15} />
        </View>
        <Text style={styles.openingText}>
          {openNow === false ? 'Closed now' : 'Open now'} | {open} - {close}
        </Text>
      </View>
    </View>
  );
}

function ActionButtons() {
  return (
    <View style={styles.actionRow}>
      <Pressable style={styles.actionButton}>
        <Ionicons color={colors.goldDark} name="navigate" size={18} />
        <Text style={styles.actionButtonText}>Get Directions</Text>
      </Pressable>
      <Pressable style={styles.actionButton}>
        <Ionicons color={colors.goldDark} name="call-outline" size={18} />
        <Text style={styles.actionButtonText}>Call Salon</Text>
      </Pressable>
    </View>
  );
}

function DetailTabs({
  activeTab,
  onTabPress,
}: {
  activeTab: SectionKey;
  onTabPress: (section: SectionKey) => void;
}) {
  const tabs: { key: SectionKey; label: string }[] = [
    { key: 'services', label: 'Services' },
    { key: 'reviews', label: 'Reviews' },
    { key: 'about', label: 'About' },
  ];

  return (
    <View style={styles.tabsWrap}>
      {tabs.map((tab) => {
        const isActive = tab.key === activeTab;
        return (
          <Pressable
            key={tab.key}
            onPress={() => onTabPress(tab.key)}
            style={[styles.tabButton, isActive && styles.tabButtonActive]}
          >
            <Text style={[styles.tabText, isActive && styles.tabTextActive]}>{tab.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function ServiceList({ services }: { services: SalonService[] }) {
  return (
    <View style={styles.block}>
      <Text style={styles.blockTitle}>Services</Text>
      {services.length === 0 ? (
        <Text style={styles.emptyText}>No services listed yet.</Text>
      ) : (
        <View style={styles.serviceList}>
          {services.map((svc) => {
            const hasDiscount = svc.discounted_price != null && svc.discounted_price < svc.price;
            return (
              <View key={svc.id} style={styles.serviceRow}>
                <View style={styles.serviceRowLeft}>
                  <Text style={styles.serviceRowName}>{svc.name}</Text>
                  {svc.description ? (
                    <Text numberOfLines={2} style={styles.serviceRowDesc}>
                      {svc.description}
                    </Text>
                  ) : null}
                  <Text style={styles.serviceRowDuration}>{svc.duration_minutes} min</Text>
                </View>
                <View style={styles.serviceRowPrice}>
                  {hasDiscount ? (
                    <Text style={styles.serviceStrike}>{priceText(svc.price)}</Text>
                  ) : null}
                  <Text style={styles.servicePrice}>
                    {priceText(hasDiscount ? (svc.discounted_price as number) : svc.price)}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}

function FacilitiesList() {
  return (
    <View style={styles.block}>
      <Text style={styles.sectionCapsTitle}>FACILITIES</Text>
      <View style={styles.facilitiesGrid}>
        {facilities.map((facility) => (
          <View key={facility} style={styles.facilityItem}>
            <Ionicons color={colors.goldDark} name="checkmark-circle" size={18} />
            <Text style={styles.facilityText}>{facility}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function ReviewsSection({
  reviews,
  loading,
  rating,
  count,
}: {
  reviews: SalonReview[];
  loading: boolean;
  rating: string;
  count: number;
}) {
  return (
    <View style={styles.block}>
      <Text style={styles.blockTitle}>Reviews & Ratings</Text>
      <View style={styles.ratingCard}>
        <View>
          <Text style={styles.ratingValue}>{rating} ★</Text>
          <Text style={styles.ratingMeta}>
            Based on {count} {count === 1 ? 'review' : 'reviews'}
          </Text>
        </View>
        <Pressable style={styles.writeReviewButton}>
          <Text style={styles.writeReviewText}>Write Review</Text>
        </Pressable>
      </View>

      {loading ? (
        <ActivityIndicator color={colors.gold} style={{ marginTop: 16 }} />
      ) : reviews.length === 0 ? (
        <Text style={styles.emptyText}>No reviews yet. Be the first to review!</Text>
      ) : (
        reviews.map((review) => <ReviewCard key={review.id} review={review} />)
      )}
    </View>
  );
}

function timeAgo(iso: string) {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '';
  const days = Math.floor((Date.now() - then) / 86400000);
  if (days <= 0) return 'Today';
  if (days === 1) return '1 day ago';
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  return months === 1 ? '1 month ago' : `${months} months ago`;
}

function ReviewCard({ review }: { review: SalonReview }) {
  const stars = '★'.repeat(Math.round(review.rating)).padEnd(5, '☆');
  const initial = review.customer_name?.trim()?.[0]?.toUpperCase() ?? '?';
  return (
    <View style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <View style={styles.reviewUser}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarInitial}>{initial}</Text>
          </View>
          <View>
            <Text style={styles.reviewName}>{review.customer_name}</Text>
            <Text style={styles.reviewTime}>{timeAgo(review.created_at)}</Text>
          </View>
        </View>
        <Text style={styles.reviewStars}>{stars}</Text>
      </View>

      {(review.is_verified || review.service_name) ? (
        <View style={styles.reviewMetaRow}>
          {review.is_verified ? (
            <View style={styles.verifiedBadge}>
              <Text style={styles.verifiedBadgeText}>Verified Customer</Text>
            </View>
          ) : null}
          {review.service_name ? (
            <View style={styles.serviceReviewChip}>
              <Text style={styles.serviceReviewChipText}>{review.service_name}</Text>
            </View>
          ) : null}
        </View>
      ) : null}

      {review.comment ? <Text style={styles.reviewCopy}>{review.comment}</Text> : null}

      {review.vendor_response ? (
        <View style={styles.vendorResponse}>
          <Text style={styles.vendorResponseLabel}>Response from salon</Text>
          <Text style={styles.vendorResponseText}>{review.vendor_response}</Text>
        </View>
      ) : null}
    </View>
  );
}

function AboutSection({ name, description }: { name: string; description?: string | null }) {
  return (
    <View style={styles.block}>
      <Text style={styles.blockTitle}>About {name}</Text>
      <Text style={styles.aboutCopy}>
        {description?.trim() || 'No description provided for this salon yet.'}
      </Text>
    </View>
  );
}

function LocationCard({ name, location }: { name: string; location: string }) {
  return (
    <View style={[styles.block, styles.locationCard]}>
      <Text style={styles.blockTitle}>Location</Text>
      <View style={styles.metaLine}>
        <Ionicons color={colors.goldDark} name="location-sharp" size={15} />
        <View style={styles.locationTextWrap}>
          <Text style={styles.locationBranch}>{name}</Text>
          <Text style={styles.locationAddress}>{location}</Text>
        </View>
      </View>

      <View style={styles.mapWrap}>
        <Image source={mapImg} style={styles.mapImage} />
        <View style={styles.mapOverlay} />
        <Ionicons color={colors.gold} name="location" size={28} style={styles.mapMarker} />
      </View>
    </View>
  );
}

function StickyBookButton({ onPress }: { onPress: () => void }) {
  return (
    <View style={styles.bookButtonShell}>
      <Pressable onPress={onPress} style={styles.bookButton}>
        <Text style={styles.bookButtonText}>Book Services  →</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.background,
    flex: 1,
  },
  screen: {
    backgroundColor: colors.background,
    flex: 1,
  },
  center: {
    alignItems: 'center',
    flex: 1,
    gap: 16,
    justifyContent: 'center',
    padding: 24,
  },
  errorText: {
    color: colors.muted,
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    textAlign: 'center',
  },
  retryBtn: {
    backgroundColor: colors.gold,
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  retryText: {
    color: colors.white,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
  },
  backLink: {
    color: colors.subtle,
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
  },
  content: {
    paddingBottom: 132,
  },
  heroWrap: {
    height: 208,
    position: 'relative',
  },
  heroImage: {
    height: '100%',
    width: '100%',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(27, 18, 12, 0.22)',
  },
  heroBackButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    left: 16,
    position: 'absolute',
    top: 54,
    width: 40,
  },
  thumbnailRow: {
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  thumbnailWrap: {
    borderRadius: 12,
    height: 70,
    overflow: 'hidden',
    position: 'relative',
    width: 70,
  },
  thumbnail: {
    height: '100%',
    width: '100%',
  },
  thumbnailOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
  },
  thumbnailOverlayText: {
    color: colors.white,
    fontFamily: 'Inter_500Medium',
    fontSize: 10,
    textAlign: 'center',
  },
  sectionCard: {
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  infoRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoTextWrap: {
    flex: 1,
  },
  salonName: {
    color: colors.text,
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 22,
    letterSpacing: -0.44,
    lineHeight: 28.6,
  },
  salonCategory: {
    color: colors.muted,
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    lineHeight: 20,
    marginTop: 2,
  },
  infoIcons: {
    flexDirection: 'row',
    gap: 10,
    marginLeft: 12,
  },
  infoIconButton: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 18,
    borderWidth: 1,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  metaLine: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  metaLineText: {
    color: colors.muted,
    flex: 1,
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    lineHeight: 20,
  },
  openingPill: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginTop: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  openingLeft: {
    alignItems: 'center',
    flexDirection: 'row',
    flex: 1,
  },
  openingCheck: {
    alignItems: 'center',
    backgroundColor: colors.greenSoft,
    borderRadius: 12,
    height: 24,
    justifyContent: 'center',
    marginRight: 10,
    width: 24,
  },
  openingClosed: {
    backgroundColor: '#9CA3AF',
  },
  openingText: {
    color: colors.text,
    flex: 1,
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginHorizontal: 16,
    marginTop: 14,
  },
  actionButton: {
    alignItems: 'center',
    backgroundColor: colors.action,
    borderColor: colors.border,
    borderRadius: 6,
    borderWidth: 1,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: 12,
  },
  actionButtonText: {
    color: colors.text,
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    marginLeft: 8,
  },
  tabsWrap: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 18,
    padding: 4,
  },
  tabButton: {
    alignItems: 'center',
    borderRadius: 12,
    flex: 1,
    paddingVertical: 10,
  },
  tabButtonActive: {
    backgroundColor: colors.gold,
  },
  tabText: {
    color: colors.muted,
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
  },
  tabTextActive: {
    color: colors.white,
  },
  block: {
    marginHorizontal: 16,
    marginTop: 24,
  },
  blockTitle: {
    color: colors.text,
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 20,
    letterSpacing: -0.2,
    marginBottom: 14,
  },
  sectionCapsTitle: {
    color: colors.text,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    letterSpacing: 1.1,
    marginBottom: 14,
  },
  emptyText: {
    color: colors.subtle,
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    paddingVertical: 8,
  },
  serviceList: {
    gap: 12,
  },
  serviceRow: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 14,
  },
  serviceRowLeft: {
    flex: 1,
    gap: 3,
    paddingRight: 12,
  },
  serviceRowName: {
    color: colors.text,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
  },
  serviceRowDesc: {
    color: colors.subtle,
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    lineHeight: 17,
  },
  serviceRowDuration: {
    color: colors.muted,
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    marginTop: 2,
  },
  serviceRowPrice: {
    alignItems: 'flex-end',
  },
  serviceStrike: {
    color: colors.subtle,
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    textDecorationLine: 'line-through',
  },
  servicePrice: {
    color: colors.text,
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
  },
  facilitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: 14,
  },
  facilityItem: {
    alignItems: 'center',
    flexDirection: 'row',
    width: '50%',
  },
  facilityText: {
    color: colors.muted,
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    marginLeft: 8,
  },
  ratingCard: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  ratingValue: {
    color: colors.text,
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 20,
    letterSpacing: -0.4,
  },
  ratingMeta: {
    color: colors.subtle,
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    marginTop: 4,
  },
  writeReviewButton: {
    alignItems: 'center',
    backgroundColor: colors.gold,
    borderRadius: 8,
    justifyContent: 'center',
    minHeight: 42,
    paddingHorizontal: 14,
  },
  writeReviewText: {
    color: colors.white,
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
  },
  reviewCard: {
    backgroundColor: colors.surfaceStrong,
    borderColor: colors.border,
    borderRadius: 18,
    borderWidth: 1,
    marginTop: 14,
    padding: 16,
  },
  reviewHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  reviewUser: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  avatarCircle: {
    alignItems: 'center',
    backgroundColor: colors.avatar,
    borderRadius: 22,
    height: 44,
    justifyContent: 'center',
    marginRight: 12,
    overflow: 'hidden',
    width: 44,
  },
  avatarInitial: {
    color: colors.white,
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 18,
  },
  reviewName: {
    color: colors.text,
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 16,
  },
  reviewTime: {
    color: colors.subtle,
    fontFamily: 'Montserrat_400Regular',
    fontSize: 12,
    marginTop: 4,
  },
  reviewStars: {
    color: colors.gold,
    fontSize: 14,
  },
  reviewMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 14,
  },
  verifiedBadge: {
    backgroundColor: '#DCFCE7',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  verifiedBadgeText: {
    color: '#16A34A',
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
  },
  serviceReviewChip: {
    backgroundColor: colors.chip,
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  serviceReviewChipText: {
    color: colors.text,
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
  },
  reviewCopy: {
    color: colors.muted,
    fontFamily: 'Montserrat_400Regular',
    fontSize: 14,
    lineHeight: 22.75,
    marginTop: 14,
  },
  vendorResponse: {
    backgroundColor: colors.action,
    borderRadius: 12,
    marginTop: 14,
    padding: 12,
  },
  vendorResponseLabel: {
    color: colors.goldDark,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    marginBottom: 4,
  },
  vendorResponseText: {
    color: colors.muted,
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    lineHeight: 19,
  },
  aboutCopy: {
    color: colors.muted,
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    lineHeight: 26,
  },
  locationCard: {
    backgroundColor: colors.surfaceStrong,
    borderColor: colors.border,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 16,
    padding: 16,
  },
  locationTextWrap: {
    flex: 1,
  },
  locationBranch: {
    color: colors.text,
    fontFamily: 'Montserrat_700Bold',
    fontSize: 16,
  },
  locationAddress: {
    color: colors.muted,
    fontFamily: 'Montserrat_400Regular',
    fontSize: 14,
    lineHeight: 22.75,
    marginTop: 4,
  },
  mapWrap: {
    borderRadius: 18,
    height: 170,
    marginTop: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  mapImage: {
    height: '100%',
    width: '100%',
  },
  mapOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(36, 27, 20, 0.28)',
  },
  mapMarker: {
    left: '50%',
    marginLeft: -14,
    marginTop: -14,
    position: 'absolute',
    top: '50%',
  },
  bookButtonShell: {
    backgroundColor: 'rgba(255, 250, 245, 0.98)',
    borderTopColor: colors.border,
    borderTopWidth: 1,
    bottom: 0,
    left: 0,
    paddingBottom: 16,
    paddingHorizontal: 16,
    paddingTop: 12,
    position: 'absolute',
    right: 0,
  },
  bookButton: {
    alignItems: 'center',
    backgroundColor: colors.gold,
    borderRadius: 12,
    height: 56,
    justifyContent: 'center',
  },
  bookButtonText: {
    color: colors.white,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    letterSpacing: 0.4,
  },
});
