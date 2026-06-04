import { Ionicons } from '@expo/vector-icons';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { auraWellness, luminaStudio } from '@/features/client/data/salons';
import type {
  ClientStackParamList,
  ClientTabParamList,
  SalonRouteData,
} from '@/navigation/navigation.types';

// Card images shared with the home "Top Rated" section (exported 1:1 from Figma).
const topLumina = require('@/assets/home/top-lumina.png');
const topAura = require('@/assets/home/top-aura.png');

const colors = {
  white: '#FFFFFF',
  headerBorder: '#F3F4F6',
  heading: '#221A11',
  text: '#534433',
  gold: '#F89E07',
  orange: '#F97316',
  bg: '#FFFAF5',
  searchBorder: '#E7D7C9',
  resultsMuted: '#6B7280',
  mapBg: '#FFE9D6',
  sectionHeading: '#655D52',
  cardBg: '#FFF1E6',
  cardBorder: 'rgba(231, 215, 201, 0.5)',
  ratingBg: '#F0E0D1',
  chipBg: '#EDE1D2',
  chipUnisex: '#6B6357',
  giftStripBg: '#221A11',
  giftStripText: '#FFF8F4',
  favBg: 'rgba(255, 255, 255, 0.8)',
  dotInactive: 'rgba(255, 255, 255, 0.6)',
};

type DiscoverNavigation = BottomTabNavigationProp<ClientTabParamList>;

export function ClientDiscoverScreen() {
  const navigation = useNavigation<DiscoverNavigation>();
  const parent = navigation.getParent<NativeStackNavigationProp<ClientStackParamList>>();
  const openSalon = (salon: SalonRouteData) => parent?.navigate('SalonDetails', { salon });

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
      <MainHeader
        onBack={() => navigation.navigate('Home')}
        onCart={() => navigation.navigate('Shopping')}
      />
      <SearchSection />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.resultsHeader}>
          <Text style={styles.resultsText}>4 salons found</Text>
          <Pressable style={styles.mapButton}>
            <Ionicons color={colors.orange} name="navigate-outline" size={13} />
            <Text style={styles.mapButtonText}>Map View</Text>
          </Pressable>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SALONS NEAR YOU</Text>
          <View style={styles.list}>
            <SalonCard
              chips={['UNISEX', 'HAIR & SPA']}
              image={topLumina}
              location="Downtown Ave • 1.2 km"
              name="Lumina Studio"
              offer="40% OFF"
              onPress={() => openSalon(luminaStudio)}
              rating="5.0"
            />
            <SalonCard
              chips={['UNISEX', 'MASSAGE']}
              giftStrip
              image={topAura}
              location="Westside District • 2.5 km"
              name="Aura Wellness"
              offer="GIFT CARD DEAL"
              onPress={() => openSalon(auraWellness)}
              rating="4.9"
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function MainHeader({ onBack, onCart }: { onBack: () => void; onCart: () => void }) {
  return (
    <View style={styles.mainHeader}>
      <View style={styles.mainHeaderLeft}>
        <Pressable onPress={onBack}>
          <Ionicons color={colors.heading} name="arrow-back" size={24} />
        </Pressable>
        <Text style={styles.headerTitle}>Services</Text>
      </View>

      <Pressable onPress={onCart} style={styles.cartWrap}>
        <Ionicons color={colors.heading} name="cart-outline" size={24} />
        <View style={styles.cartBadge}>
          <Text style={styles.cartBadgeText}>4</Text>
        </View>
      </Pressable>
    </View>
  );
}

function SearchSection() {
  return (
    <View style={styles.searchSection}>
      <View style={styles.searchInputWrap}>
        <Ionicons color={colors.text} name="search-outline" size={18} />
        <TextInput
          placeholder="Search salons, services..."
          placeholderTextColor={colors.text}
          style={styles.searchInput}
        />
      </View>
      <Pressable style={styles.filterButton}>
        <Ionicons color={colors.white} name="options-outline" size={16} />
      </Pressable>
    </View>
  );
}

function SalonCard({
  chips,
  giftStrip = false,
  image,
  location,
  name,
  offer,
  onPress,
  rating,
}: {
  chips: string[];
  giftStrip?: boolean;
  image: number;
  location: string;
  name: string;
  offer: string;
  onPress: () => void;
  rating: string;
}) {
  return (
    <Pressable onPress={onPress} style={styles.card}>
      <View style={styles.imageWrap}>
        <Image source={image} style={styles.cardImage} />

        <View style={[styles.offerStrip, giftStrip && styles.offerStripGift]}>
          <Text style={[styles.offerStripText, giftStrip && styles.offerStripTextGift]}>
            {offer}
          </Text>
        </View>

        <Pressable style={styles.favButton}>
          <Ionicons color={colors.heading} name="heart-outline" size={17} />
        </Pressable>

        <View style={styles.imageDots}>
          <View style={[styles.imageDot, styles.imageDotActive]} />
          <View style={styles.imageDot} />
          <View style={styles.imageDot} />
        </View>
      </View>

      <View style={styles.cardContent}>
        <View style={styles.cardTitleRow}>
          <Text style={styles.cardName}>{name}</Text>
          <View style={styles.ratingBadge}>
            <Ionicons color={colors.gold} name="star" size={11} />
            <Text style={styles.ratingText}>{rating}</Text>
          </View>
        </View>

        <View style={styles.locationRow}>
          <Ionicons color={colors.text} name="location-outline" size={14} />
          <Text style={styles.locationText}>{location}</Text>
        </View>

        <View style={styles.chipRow}>
          {chips.map((chip, index) => (
            <View key={chip} style={styles.chip}>
              <Text style={[styles.chipText, index === 0 && styles.chipTextUnisex]}>{chip}</Text>
            </View>
          ))}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.bg,
    flex: 1,
  },
  mainHeader: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderBottomColor: colors.headerBorder,
    borderBottomWidth: 1,
    flexDirection: 'row',
    height: 72,
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  mainHeaderLeft: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 16,
  },
  headerTitle: {
    color: colors.heading,
    fontFamily: 'Poppins_700Bold',
    fontSize: 20,
  },
  cartWrap: {
    height: 24,
    width: 24,
  },
  cartBadge: {
    alignItems: 'center',
    backgroundColor: colors.gold,
    borderColor: colors.white,
    borderRadius: 9999,
    borderWidth: 2,
    height: 20,
    justifyContent: 'center',
    minWidth: 20,
    paddingHorizontal: 3,
    position: 'absolute',
    right: -8,
    top: -8,
  },
  cartBadgeText: {
    color: colors.white,
    fontFamily: 'Montserrat_700Bold',
    fontSize: 10,
  },
  searchSection: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 2,
    flexDirection: 'row',
    gap: 12,
    paddingBottom: 16,
    paddingHorizontal: 16,
    paddingTop: 24,
    shadowColor: 'rgba(0, 0, 0, 0.05)',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 2,
  },
  searchInputWrap: {
    alignItems: 'center',
    borderColor: colors.searchBorder,
    borderRadius: 9999,
    borderWidth: 1,
    flex: 1,
    flexDirection: 'row',
    gap: 10,
    height: 44,
    paddingHorizontal: 16,
  },
  searchInput: {
    color: colors.text,
    flex: 1,
    fontFamily: 'Montserrat_500Medium',
    fontSize: 16,
  },
  filterButton: {
    alignItems: 'center',
    backgroundColor: colors.orange,
    borderRadius: 9999,
    elevation: 4,
    height: 40,
    justifyContent: 'center',
    shadowColor: 'rgba(249, 115, 22, 0.25)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 6,
    width: 40,
  },
  content: {
    paddingBottom: 120,
    paddingTop: 20,
  },
  resultsHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  resultsText: {
    color: colors.resultsMuted,
    fontFamily: 'Montserrat_500Medium',
    fontSize: 14,
  },
  mapButton: {
    alignItems: 'center',
    backgroundColor: colors.mapBg,
    borderRadius: 9999,
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  mapButtonText: {
    color: colors.orange,
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 12,
  },
  section: {
    gap: 16,
    paddingHorizontal: 20,
    paddingTop: 15,
  },
  sectionTitle: {
    color: colors.sectionHeading,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    letterSpacing: 1.1,
  },
  list: {
    gap: 16,
  },
  card: {
    backgroundColor: colors.cardBg,
    borderColor: colors.cardBorder,
    borderRadius: 8,
    borderWidth: 1,
    elevation: 3,
    overflow: 'hidden',
    shadowColor: 'rgba(44, 44, 44, 0.08)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 20,
  },
  imageWrap: {
    height: 150,
    position: 'relative',
  },
  cardImage: {
    height: '100%',
    width: '100%',
  },
  offerStrip: {
    backgroundColor: colors.gold,
    borderBottomRightRadius: 4,
    left: 0,
    paddingHorizontal: 24,
    paddingVertical: 8,
    position: 'absolute',
    top: 16,
  },
  offerStripGift: {
    backgroundColor: colors.giftStripBg,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  offerStripText: {
    color: colors.white,
    fontFamily: 'Inter_800ExtraBold',
    fontSize: 13,
  },
  offerStripTextGift: {
    color: colors.giftStripText,
    fontFamily: 'Inter_700Bold',
    fontSize: 11,
  },
  favButton: {
    alignItems: 'center',
    backgroundColor: colors.favBg,
    borderRadius: 12,
    height: 32,
    justifyContent: 'center',
    position: 'absolute',
    right: 12,
    top: 12,
    width: 32,
  },
  imageDots: {
    alignItems: 'center',
    bottom: 12,
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
  },
  imageDot: {
    backgroundColor: colors.dotInactive,
    borderRadius: 4,
    height: 6,
    width: 6,
  },
  imageDotActive: {
    backgroundColor: colors.white,
    width: 18,
  },
  cardContent: {
    gap: 8,
    padding: 16,
  },
  cardTitleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardName: {
    color: colors.heading,
    flex: 1,
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 20,
    letterSpacing: -0.2,
    paddingRight: 10,
  },
  ratingBadge: {
    alignItems: 'center',
    backgroundColor: colors.ratingBg,
    borderRadius: 2,
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  ratingText: {
    color: colors.heading,
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
  },
  locationRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  locationText: {
    color: colors.text,
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
  },
  chipRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  chip: {
    backgroundColor: colors.chipBg,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  chipText: {
    color: colors.text,
    fontFamily: 'Inter_400Regular',
    fontSize: 10,
    letterSpacing: 0.5,
  },
  chipTextUnisex: {
    color: colors.chipUnisex,
  },
});
