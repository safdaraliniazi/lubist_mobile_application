import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useRef, useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { lumiereBeautyStudio } from '@/features/client/data/salons';
import type { ClientStackParamList, SalonRouteData } from '@/navigation/navigation.types';

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

// All assets exported 1:1 from Figma ("Salon display page").
const heroImg = require('@/assets/salon/hero.png');
const avatarEleanor = require('@/assets/salon/avatar-eleanor.png');
const review1 = require('@/assets/salon/review1.png');
const review2 = require('@/assets/salon/review2.png');
const mapImg = require('@/assets/salon/map.png');

// Gallery slot 5 reuses slot 4's image (it sits behind the "+12 More" overlay in Figma).
const gallery = [
  require('@/assets/salon/gallery1.png'),
  require('@/assets/salon/gallery2.png'),
  require('@/assets/salon/gallery3.png'),
  require('@/assets/salon/gallery4.png'),
  require('@/assets/salon/gallery4.png'),
];

const serviceItems = [
  { id: 'haircare', label: 'Hair Care', image: require('@/assets/salon/svc-haircare.png') },
  { id: 'nailbar', label: 'Nail Bar', image: require('@/assets/salon/svc-nailbar.png') },
  { id: 'face', label: 'Face', image: require('@/assets/salon/svc-face.png') },
  { id: 'treatments', label: 'Treatments', image: require('@/assets/salon/svc-treatments.png') },
  { id: 'massage', label: 'Massage & Spa', image: require('@/assets/salon/svc-massage.png') },
  { id: 'mens', label: "Men's Grooming", image: require('@/assets/salon/svc-mens.png') },
  { id: 'manicure', label: 'Manicure & Pedicure', image: require('@/assets/salon/svc-manicure.png') },
  { id: 'waxing', label: 'Waxing', image: require('@/assets/salon/svc-waxing.png') },
  { id: 'bleaching', label: 'Bleaching & Threading', image: require('@/assets/salon/svc-bleaching.png') },
  { id: 'extensions', label: 'Hair Extensions', image: require('@/assets/salon/svc-extensions.png') },
  { id: 'bridal', label: 'Bridal & Makeup', image: require('@/assets/salon/svc-bridal.png') },
  { id: 'haircare2', label: 'Hair Care', image: require('@/assets/salon/svc-haircare.png') },
];

const facilities = ['Free Wifi', 'Steam Room', 'Car Parking', 'AC', 'Sanitized Tools'];

type SalonRoute = RouteProp<ClientStackParamList, 'SalonDetails'>;
type Navigation = NativeStackNavigationProp<ClientStackParamList>;
type SectionKey = 'services' | 'reviews' | 'about';

export function SalonDetailsScreen() {
  const navigation = useNavigation<Navigation>();
  const route = useRoute<SalonRoute>();
  const salon = route.params?.salon ?? lumiereBeautyStudio;
  const scrollRef = useRef<ScrollView>(null);
  const [activeTab, setActiveTab] = useState<SectionKey>('services');
  const [sectionOffsets, setSectionOffsets] = useState<Record<SectionKey, number>>({
    about: 0,
    reviews: 0,
    services: 0,
  });

  const handleTabPress = (section: SectionKey) => {
    setActiveTab(section);
    scrollRef.current?.scrollTo({
      animated: true,
      y: Math.max(sectionOffsets[section] - 12, 0),
    });
  };

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.safeArea}>
      <View style={styles.screen}>
        <ScrollView
          contentContainerStyle={styles.content}
          ref={scrollRef}
          showsVerticalScrollIndicator={false}
        >
          <SalonHero onBackPress={() => navigation.goBack()} />
          <ThumbnailGallery />
          <SalonInfo salon={salon} />
          <OpeningPill />
          <ActionButtons />
          <DetailTabs activeTab={activeTab} onTabPress={handleTabPress} />

          <View
            onLayout={(event) => {
              const { y } = event.nativeEvent.layout;

              setSectionOffsets((prev) => ({ ...prev, services: y }));
            }}
          >
            <ServiceGrid />
          </View>

          <FacilitiesList />

          <View
            onLayout={(event) => {
              const { y } = event.nativeEvent.layout;

              setSectionOffsets((prev) => ({ ...prev, reviews: y }));
            }}
          >
            <ReviewsSection />
          </View>

          <View
            onLayout={(event) => {
              const { y } = event.nativeEvent.layout;

              setSectionOffsets((prev) => ({ ...prev, about: y }));
            }}
          >
            <AboutSection />
          </View>

          <LocationCard />
        </ScrollView>

        <StickyBookButton
          onPress={() =>
            navigation.navigate('SalonServices', { salonName: salon.name })
          }
        />
      </View>
    </SafeAreaView>
  );
}

function SalonHero({ onBackPress }: { onBackPress: () => void }) {
  return (
    <View style={styles.heroWrap}>
      <Image source={heroImg} style={styles.heroImage} />
      <View style={styles.heroOverlay} />
      <Pressable onPress={onBackPress} style={styles.heroBackButton}>
        <Ionicons color={colors.white} name="arrow-back" size={22} />
      </Pressable>
    </View>
  );
}

function ThumbnailGallery() {
  return (
    <ScrollView
      contentContainerStyle={styles.thumbnailRow}
      horizontal
      showsHorizontalScrollIndicator={false}
    >
      {gallery.map((thumb, index) => {
        const isLast = index === gallery.length - 1;

        return (
          <View key={`thumb-${index}`} style={styles.thumbnailWrap}>
            <Image source={thumb} style={styles.thumbnail} />
            {isLast ? (
              <View style={styles.thumbnailOverlay}>
                <Text style={styles.thumbnailOverlayText}>+12 More</Text>
              </View>
            ) : null}
          </View>
        );
      })}
    </ScrollView>
  );
}

function SalonInfo({ salon }: { salon: SalonRouteData }) {
  return (
    <View style={styles.sectionCard}>
      <View style={styles.infoRow}>
        <View style={styles.infoTextWrap}>
          <Text style={styles.salonName}>{salon.name || 'Looks Salon'}</Text>
          <Text style={styles.salonCategory}>{salon.category || 'Unisex'}</Text>
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
        <Text style={styles.metaLineText}>{salon.location || 'Zoaharabagh 4/250B'}</Text>
      </View>

      <View style={styles.metaLine}>
        <Ionicons color={colors.goldDark} name="star" size={15} />
        <Text style={styles.metaLineText}>
          {salon.rating} ({salon.reviewCount || 120} Reviews) • {salon.distance || '0.8 miles away'}
        </Text>
      </View>
    </View>
  );
}

function OpeningPill() {
  return (
    <View style={styles.openingPill}>
      <View style={styles.openingLeft}>
        <View style={styles.openingCheck}>
          <Ionicons color={colors.white} name="checkmark" size={15} />
        </View>
        <Text style={styles.openingText}>Open now | 10:00 AM - 09:00 PM</Text>
      </View>
      <Ionicons color={colors.muted} name="chevron-down" size={18} />
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

function ServiceGrid() {
  return (
    <View style={styles.block}>
      <Text style={styles.blockTitle}>Services</Text>
      <View style={styles.serviceGrid}>
        {serviceItems.map((item) => (
          <View key={item.id} style={styles.serviceItem}>
            <View style={styles.serviceTileWrap}>
              <Image source={item.image} style={styles.serviceTileImage} />
            </View>
            <Text style={styles.serviceLabel}>{item.label}</Text>
          </View>
        ))}
      </View>
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

function ReviewsSection() {
  return (
    <View style={styles.block}>
      <Text style={styles.blockTitle}>Reviews & Ratings</Text>
      <RatingSummary />
      <View style={styles.reviewFilterRow}>
        <View style={[styles.reviewFilterChip, styles.reviewFilterChipActive]}>
          <Text style={[styles.reviewFilterText, styles.reviewFilterTextActive]}>All Reviews</Text>
        </View>
        <View style={styles.reviewFilterChip}>
          <Text style={styles.reviewFilterText}>Hair Styling</Text>
        </View>
        <View style={styles.reviewFilterChip}>
          <Text style={styles.reviewFilterText}>Coloring</Text>
        </View>
      </View>
      <ReviewCard />
    </View>
  );
}

function RatingSummary() {
  return (
    <View style={styles.ratingCard}>
      <View>
        <Text style={styles.ratingValue}>4.8 ★</Text>
        <Text style={styles.ratingMeta}>Based on 124 reviews</Text>
      </View>
      <Pressable style={styles.writeReviewButton}>
        <Text style={styles.writeReviewText}>Write Review</Text>
      </Pressable>
    </View>
  );
}

function ReviewCard() {
  return (
    <View style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <View style={styles.reviewUser}>
          <View style={styles.avatarCircle}>
            <Image source={avatarEleanor} style={styles.avatarImage} />
          </View>
          <View>
            <Text style={styles.reviewName}>Eleanor Vance</Text>
            <Text style={styles.reviewTime}>2 days ago</Text>
          </View>
        </View>
        <Text style={styles.reviewStars}>★★★★★</Text>
      </View>

      <View style={styles.reviewMetaRow}>
        <View style={styles.verifiedBadge}>
          <Text style={styles.verifiedBadgeText}>Verified Customer</Text>
        </View>
        <View style={styles.serviceReviewChip}>
          <Text style={styles.serviceReviewChipText}>Balayage Retouch</Text>
        </View>
      </View>

      <Text style={styles.reviewCopy}>
        Absolutely breathtaking experience. The atmosphere here is unlike any other salon in the
        city, it feels like stepping into a tranquil oasis. Sarah understood exactly what I wanted
        with my color, achieving a perfect sunkissed look without any damage. The scalp massage
        during the wash was heavenly.
      </Text>

      <View style={styles.reviewImagesRow}>
        <Image source={review1} style={styles.reviewImage} />
        <Image source={review2} style={styles.reviewImage} />
      </View>
    </View>
  );
}

function AboutSection() {
  return (
    <View style={styles.block}>
      <Text style={styles.blockTitle}>About Looks Salon</Text>
      <Text style={styles.aboutCopy}>
        Established in 1989, Looks Salon has grown to become one of the most reputable premium
        salon chains in the region. Our heritage is built on a foundation of exceptional
        craftsmanship and a commitment to providing a luxurious, transformative experience for
        every guest. We pride ourselves on staying ahead of global trends while maintaining the
        personalized touch that defines our premium quality standards.
      </Text>
    </View>
  );
}

function LocationCard() {
  return (
    <View style={[styles.block, styles.locationCard]}>
      <Text style={styles.blockTitle}>Location</Text>
      <View style={styles.metaLine}>
        <Ionicons color={colors.goldDark} name="location-sharp" size={15} />
        <View style={styles.locationTextWrap}>
          <Text style={styles.locationBranch}>Zoaharabagh Branch</Text>
          <Text style={styles.locationAddress}>
            4/250B, Main Market Road, Zoaharabagh District, Pin: 110001
          </Text>
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
  serviceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 16,
  },
  serviceItem: {
    width: '23%',
  },
  serviceTileWrap: {
    borderColor: 'transparent',
    borderRadius: 18,
    borderWidth: 2,
    overflow: 'hidden',
    position: 'relative',
  },
  serviceTileSelected: {
    borderColor: colors.gold,
  },
  serviceTileImage: {
    height: 76,
    width: '100%',
  },
  serviceSelectedBadge: {
    alignItems: 'center',
    backgroundColor: colors.gold,
    borderRadius: 10,
    height: 20,
    justifyContent: 'center',
    position: 'absolute',
    right: 6,
    top: 6,
    width: 20,
  },
  serviceLabel: {
    color: colors.text,
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    lineHeight: 13.75,
    marginTop: 8,
    textAlign: 'center',
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
  reviewFilterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 14,
  },
  reviewFilterChip: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  reviewFilterChipActive: {
    borderColor: colors.gold,
  },
  reviewFilterText: {
    color: colors.muted,
    fontFamily: 'Inter_500Medium',
    fontSize: 12.5,
  },
  reviewFilterTextActive: {
    color: colors.goldDark,
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
  avatarImage: {
    height: '100%',
    width: '100%',
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
  reviewImagesRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  reviewImage: {
    borderRadius: 14,
    height: 86,
    width: 86,
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
