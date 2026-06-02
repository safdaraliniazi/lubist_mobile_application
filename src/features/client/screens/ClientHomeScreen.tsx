import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  auraWellness,
  lumiereBeautyStudio,
  luminaStudio,
  maisonGlowAtelier,
} from '@/features/client/data/salons';
import type {
  ClientStackParamList,
  ClientTabParamList,
  SalonRouteData,
} from '@/navigation/navigation.types';

const colors = {
  background: '#f7f0e8',
  surface: '#fffaf4',
  surfaceStrong: '#fffdf8',
  text: '#2f221a',
  muted: '#7d6d63',
  subtle: '#aa9789',
  border: '#eadccf',
  gold: '#d88a37',
  goldDark: '#bf7021',
  chip: '#f4e7d8',
  offer: '#f7e4cf',
  white: '#ffffff',
};

const salonBanner =
  'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=1400&q=80';
const profileAvatar =
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80';
const productOlaplex =
  'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80';
const productKerastase =
  'https://images.unsplash.com/photo-1596704017254-9f0a0b4f6a87?auto=format&fit=crop&w=800&q=80';
const productLoreal =
  'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80';
const productMore =
  'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?auto=format&fit=crop&w=800&q=80';
const serviceStylist =
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=600&q=80';

const offers = [
  {
    id: 'offer-1',
    title: 'Flat 10% OFF',
    subtitle: 'On all services with online payment.',
  },
  {
    id: 'offer-2',
    title: 'Pamper Day Deal',
    subtitle: 'Save on spa rituals and hair care bundles.',
  },
];

const essentials = [
  { id: 'olaplex', label: 'Olaplex', image: productOlaplex },
  { id: 'kerastase', label: 'Kerastase', image: productKerastase },
  { id: 'loreal', label: "L'Oreal", image: productLoreal },
  { id: 'more', label: 'More', image: productMore },
];

const nearbySalons = [
  {
    ...lumiereBeautyStudio,
    heroImage: lumiereBeautyStudio.heroImage,
    timing: 'Avail now',
  },
  {
    ...maisonGlowAtelier,
    heroImage: maisonGlowAtelier.heroImage,
    timing: 'Opens 10 AM',
  },
];

const serviceCards = [
  { id: 'svc-1', title: 'Salons', subtitle: 'Grooming' },
  { id: 'svc-2', title: 'Dermatologists', subtitle: 'Skincare' },
  { id: 'svc-3', title: 'Spa & Wellness', subtitle: 'Relaxation' },
  { id: 'svc-4', title: 'Salons', subtitle: 'Styling' },
];

const topRatedSalons = [
  luminaStudio,
  auraWellness,
];

const nearbyCategories = ['Hair', 'Nails', 'Skin', 'Brows'];

export function ClientHomeScreen() {
  const navigation = useNavigation<BottomTabNavigationProp<ClientTabParamList>>();
  const parentNavigation = navigation.getParent<NativeStackNavigationProp<ClientStackParamList>>();

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
      <View style={styles.screen}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Header />
          <HeroBanner />
          <SearchBar />
          <AppointmentCard />

          <SectionHeader title="CURRENT OFFERS" />
          <ScrollView
            contentContainerStyle={styles.horizontalSectionContent}
            horizontal
            showsHorizontalScrollIndicator={false}
          >
            {offers.map((offer) => (
              <OfferCard key={offer.id} title={offer.title} subtitle={offer.subtitle} />
            ))}
          </ScrollView>
          <PaginationDots count={3} activeIndex={0} />

          <EssentialsSection />

          <NearYouSection
            onSalonPress={(salon) => parentNavigation?.navigate('SalonDetails', { salon })}
          />

          <ServicesSection />

          <SectionHeader title="TOP RATED SALONS" />
          <View style={styles.topRatedList}>
            {topRatedSalons.map((salon) => (
              <TopRatedSalonCard
                key={salon.id}
                onPress={() => parentNavigation?.navigate('SalonDetails', { salon })}
                salon={salon}
              />
            ))}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

function Header() {
  return (
    <View style={styles.header}>
      <View style={styles.headerLocation}>
        <View style={styles.locationRow}>
          <Ionicons color={colors.gold} name="location-sharp" size={18} />
          <Text style={styles.homeTitle}>Home</Text>
          <Ionicons color={colors.goldDark} name="chevron-down" size={16} />
        </View>
        <Text style={styles.addressText}>123 Beauty Lane, Manhattan, NY</Text>
      </View>

      <View style={styles.headerActions}>
        <Pressable style={styles.offerPill}>
          <Ionicons color={colors.goldDark} name="pricetag-outline" size={14} />
          <Text style={styles.offerPillText}>Offers</Text>
        </Pressable>
        <Image source={{ uri: profileAvatar }} style={styles.avatar} />
      </View>
    </View>
  );
}

function HeroBanner() {
  return (
    <View style={styles.heroBanner}>
      <Image source={{ uri: salonBanner }} style={styles.heroBannerImage} />
      <View style={styles.heroBannerOverlay} />
      <View style={styles.heroBannerContent}>
        <Text style={styles.heroEyebrow}>Salon Services</Text>
        <Text style={styles.heroTitle}>At your Doorstep</Text>
        <Text style={styles.heroSubtitle}>Glow anytime, Anywhere</Text>
      </View>
    </View>
  );
}

function SearchBar() {
  return (
    <View style={styles.searchBar}>
      <Ionicons color={colors.subtle} name="search-outline" size={20} />
      <TextInput
        placeholder="Search for a place or service"
        placeholderTextColor={colors.subtle}
        style={styles.searchInput}
      />
    </View>
  );
}

function AppointmentCard() {
  return (
    <Pressable style={styles.appointmentCard}>
      <View style={styles.appointmentCardLeft}>
        <View style={styles.appointmentIconShell}>
          <Ionicons color={colors.goldDark} name="calendar-outline" size={18} />
        </View>
        <Text style={styles.appointmentText}>My Appointments</Text>
      </View>
      <Ionicons color={colors.goldDark} name="chevron-forward" size={18} />
    </Pressable>
  );
}

function OfferCard({ subtitle, title }: { subtitle: string; title: string }) {
  return (
    <View style={styles.offerCard}>
      <View style={styles.offerTag}>
        <Ionicons color={colors.goldDark} name="pricetag" size={16} />
      </View>
      <Text style={styles.offerCardTitle}>{title}</Text>
      <Text style={styles.offerCardSubtitle}>{subtitle}</Text>
    </View>
  );
}

function EssentialsSection() {
  return (
    <View style={styles.sectionBlock}>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>BEAUTY ESSENTIALS</Text>
        <Ionicons color={colors.goldDark} name="arrow-forward" size={16} />
      </View>

      <ScrollView
        contentContainerStyle={styles.essentialsRow}
        horizontal
        showsHorizontalScrollIndicator={false}
      >
        {essentials.map((item) => (
          <View key={item.id} style={styles.essentialItem}>
            <Image source={{ uri: item.image }} style={styles.essentialImage} />
            <Text style={styles.essentialLabel}>{item.label}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

function NearYouSection({ onSalonPress }: { onSalonPress: (salon: SalonRouteData) => void }) {
  return (
    <View style={styles.sectionBlock}>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>NEAR YOU</Text>
        <Text style={styles.seeAllText}>SEE ALL ›</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.horizontalSectionContent}
        horizontal
        showsHorizontalScrollIndicator={false}
      >
        {nearbySalons.map((salon) => (
          <NearYouCard key={salon.id} onPress={() => onSalonPress(salon)} salon={salon} />
        ))}
      </ScrollView>

      <View style={styles.chipRow}>
        {nearbyCategories.map((category) => (
          <View key={category} style={styles.categoryChip}>
            <Text style={styles.categoryChipText}>{category}</Text>
          </View>
        ))}
      </View>

      <PaginationDots count={3} activeIndex={0} />
    </View>
  );
}

function NearYouCard({
  onPress,
  salon,
}: {
  onPress: () => void;
  salon: SalonRouteData & { timing: string };
}) {
  return (
    <Pressable onPress={onPress} style={styles.nearbyCard}>
      <Image source={{ uri: salon.heroImage }} style={styles.nearbyImage} />
      <View style={styles.nearbyBadgeLeft}>
        <Ionicons color={colors.goldDark} name="sparkles" size={13} />
      </View>
      <View style={styles.nearbyBadgeRight}>
        <Text style={styles.nearbyBadgeRightText}>★ {salon.rating}</Text>
      </View>

      <View style={styles.nearbyContent}>
        <Text style={styles.nearbyTitle}>{salon.name}</Text>
        <View style={styles.metaRow}>
          <Ionicons color={colors.muted} name="location-outline" size={14} />
          <Text style={styles.metaText}>{salon.location}</Text>
        </View>
        <View style={styles.metaRow}>
          <Ionicons color={colors.muted} name="time-outline" size={14} />
          <Text style={styles.metaText}>{salon.timing}</Text>
        </View>
      </View>
    </Pressable>
  );
}

function ServicesSection() {
  return (
    <View style={styles.sectionBlock}>
      <View style={styles.centeredDividerTitle}>
        <View style={styles.dividerLine} />
        <Text style={styles.sectionTitle}>SERVICES FOR YOU</Text>
        <View style={styles.dividerLine} />
      </View>

      <View style={styles.servicesGrid}>
        {serviceCards.map((service) => (
          <ServiceCard key={service.id} title={service.title} subtitle={service.subtitle} />
        ))}
      </View>
    </View>
  );
}

function ServiceCard({ subtitle, title }: { subtitle: string; title: string }) {
  return (
    <View style={styles.serviceCard}>
      <View style={styles.serviceAccent} />
      <View style={styles.serviceContent}>
        <View style={styles.serviceTextWrap}>
          <Text style={styles.serviceTitle}>{title}</Text>
          <Text style={styles.serviceSubtitle}>{subtitle}</Text>
        </View>
        <Image source={{ uri: serviceStylist }} style={styles.serviceImage} />
      </View>
    </View>
  );
}

function TopRatedSalonCard({ onPress, salon }: { onPress: () => void; salon: SalonRouteData }) {
  return (
    <Pressable onPress={onPress} style={styles.topRatedCard}>
      <View style={styles.topRatedImageWrap}>
        <Image source={{ uri: salon.heroImage }} style={styles.topRatedImage} />
        <View style={styles.topRatedOfferBadge}>
          <Text style={styles.topRatedOfferText}>{salon.badge}</Text>
        </View>
        <Pressable style={styles.topRatedCartButton}>
          <Ionicons color={colors.goldDark} name="bag-handle-outline" size={18} />
        </Pressable>
      </View>

      <View style={styles.topRatedContent}>
        <View style={styles.topRatedTitleRow}>
          <Text style={styles.topRatedTitle}>{salon.name}</Text>
          <Text style={styles.topRatedRating}>★ {salon.rating}</Text>
        </View>
        <View style={styles.metaRow}>
          <Ionicons color={colors.muted} name="location-outline" size={14} />
          <Text style={styles.metaText}>
            {salon.location} • {salon.distance}
          </Text>
        </View>
        <View style={styles.topRatedChipRow}>
          {salon.chips?.map((chip) => (
            <View key={chip} style={styles.topRatedChip}>
              <Text style={styles.topRatedChipText}>{chip}</Text>
            </View>
          ))}
        </View>
      </View>
    </Pressable>
  );
}

function SectionHeader({ title }: { title: string }) {
  return <Text style={styles.sectionTitle}>{title}</Text>;
}

function PaginationDots({ activeIndex, count }: { activeIndex: number; count: number }) {
  return (
    <View style={styles.paginationRow}>
      {Array.from({ length: count }).map((_, index) => (
        <View
          key={`dot-${index}`}
          style={[styles.paginationDot, index === activeIndex && styles.paginationDotActive]}
        />
      ))}
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
  scrollContent: {
    paddingBottom: 112,
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  header: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  headerLocation: {
    flex: 1,
    paddingRight: 12,
  },
  locationRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
    marginBottom: 6,
  },
  homeTitle: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '700',
  },
  addressText: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 18,
  },
  headerActions: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  offerPill: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  offerPillText: {
    color: colors.goldDark,
    fontSize: 13,
    fontWeight: '600',
  },
  avatar: {
    borderRadius: 20,
    height: 40,
    width: 40,
  },
  heroBanner: {
    borderRadius: 14,
    height: 176,
    marginBottom: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  heroBannerImage: {
    height: '100%',
    width: '100%',
  },
  heroBannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(61, 39, 20, 0.25)',
  },
  heroBannerContent: {
    bottom: 16,
    left: 16,
    position: 'absolute',
    right: 16,
  },
  heroEyebrow: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
  },
  heroTitle: {
    color: colors.white,
    fontSize: 28,
    fontWeight: '800',
  },
  heroSubtitle: {
    color: '#f8eadc',
    fontSize: 14,
    marginTop: 4,
  },
  searchBar: {
    alignItems: 'center',
    backgroundColor: colors.surfaceStrong,
    borderColor: colors.border,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    height: 50,
    marginBottom: 14,
    paddingHorizontal: 14,
  },
  searchInput: {
    color: colors.text,
    flex: 1,
    fontSize: 14,
    marginLeft: 10,
  },
  appointmentCard: {
    alignItems: 'center',
    backgroundColor: '#fdf7f0',
    borderColor: '#efc8a7',
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 22,
    minHeight: 54,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  appointmentCardLeft: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  appointmentIconShell: {
    alignItems: 'center',
    backgroundColor: '#fde9d6',
    borderRadius: 12,
    height: 34,
    justifyContent: 'center',
    marginRight: 12,
    width: 34,
  },
  appointmentText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
  },
  sectionBlock: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1.1,
    marginBottom: 14,
  },
  horizontalSectionContent: {
    gap: 12,
    paddingRight: 12,
  },
  offerCard: {
    backgroundColor: colors.offer,
    borderRadius: 18,
    minHeight: 132,
    padding: 16,
    width: 250,
  },
  offerTag: {
    alignItems: 'center',
    backgroundColor: '#fbeedc',
    borderRadius: 14,
    height: 30,
    justifyContent: 'center',
    marginBottom: 14,
    width: 30,
  },
  offerCardTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 6,
  },
  offerCardSubtitle: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 20,
  },
  paginationRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
    marginBottom: 18,
    marginTop: 12,
  },
  paginationDot: {
    backgroundColor: '#dac7b7',
    borderRadius: 4,
    height: 8,
    width: 8,
  },
  paginationDotActive: {
    backgroundColor: colors.gold,
    width: 18,
  },
  sectionHeaderRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  essentialsRow: {
    gap: 14,
    paddingRight: 10,
  },
  essentialItem: {
    width: 92,
  },
  essentialImage: {
    backgroundColor: colors.chip,
    borderRadius: 18,
    height: 84,
    marginBottom: 8,
    width: 92,
  },
  essentialLabel: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  seeAllText: {
    color: colors.goldDark,
    fontSize: 12.5,
    fontWeight: '700',
  },
  nearbyCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
    width: 252,
  },
  nearbyImage: {
    height: 150,
    width: '100%',
  },
  nearbyBadgeLeft: {
    alignItems: 'center',
    backgroundColor: '#fff3e2',
    borderRadius: 14,
    height: 28,
    justifyContent: 'center',
    left: 12,
    position: 'absolute',
    top: 12,
    width: 28,
  },
  nearbyBadgeRight: {
    backgroundColor: 'rgba(30, 22, 17, 0.72)',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 6,
    position: 'absolute',
    right: 12,
    top: 12,
  },
  nearbyBadgeRightText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '700',
  },
  nearbyContent: {
    padding: 14,
  },
  nearbyTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  metaRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
    marginTop: 4,
  },
  metaText: {
    color: colors.muted,
    fontSize: 13,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 14,
  },
  categoryChip: {
    backgroundColor: colors.chip,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  categoryChipText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '600',
  },
  centeredDividerTitle: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
  },
  dividerLine: {
    backgroundColor: colors.border,
    flex: 1,
    height: 1,
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  serviceCard: {
    backgroundColor: colors.surfaceStrong,
    borderRadius: 18,
    elevation: 4,
    minHeight: 120,
    overflow: 'hidden',
    shadowColor: '#bfa28b',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    width: '48%',
  },
  serviceAccent: {
    backgroundColor: colors.gold,
    height: '100%',
    left: 0,
    position: 'absolute',
    top: 0,
    width: 6,
  },
  serviceContent: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  serviceTextWrap: {
    flex: 1,
    paddingRight: 8,
  },
  serviceTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 6,
  },
  serviceSubtitle: {
    color: colors.muted,
    fontSize: 13,
  },
  serviceImage: {
    borderRadius: 16,
    height: 72,
    width: 54,
  },
  topRatedList: {
    gap: 16,
  },
  topRatedCard: {
    backgroundColor: colors.surfaceStrong,
    borderColor: colors.border,
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
  },
  topRatedImageWrap: {
    height: 188,
    position: 'relative',
  },
  topRatedImage: {
    height: '100%',
    width: '100%',
  },
  topRatedOfferBadge: {
    backgroundColor: colors.goldDark,
    borderBottomRightRadius: 14,
    borderTopLeftRadius: 18,
    left: 0,
    paddingHorizontal: 14,
    paddingVertical: 8,
    position: 'absolute',
    top: 0,
  },
  topRatedOfferText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '800',
  },
  topRatedCartButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 250, 244, 0.94)',
    borderRadius: 18,
    height: 36,
    justifyContent: 'center',
    position: 'absolute',
    right: 14,
    top: 14,
    width: 36,
  },
  topRatedContent: {
    padding: 16,
  },
  topRatedTitleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  topRatedTitle: {
    color: colors.text,
    flex: 1,
    fontSize: 19,
    fontWeight: '800',
    paddingRight: 10,
  },
  topRatedRating: {
    color: colors.goldDark,
    fontSize: 14,
    fontWeight: '700',
  },
  topRatedChipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 14,
  },
  topRatedChip: {
    backgroundColor: colors.chip,
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  topRatedChipText: {
    color: colors.text,
    fontSize: 11.5,
    fontWeight: '700',
  },
});
