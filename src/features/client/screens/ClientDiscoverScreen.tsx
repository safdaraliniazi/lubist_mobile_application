import { Ionicons } from '@expo/vector-icons';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import type { ImageSourcePropType } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

import type {
  ClientStackParamList,
  ClientTabParamList,
  SalonRouteData,
} from '@/navigation/navigation.types';
import { usePublicSalons, useSearchSalons, type Salon } from '@/services/api/hooks/useSalonsAPI';
import { resolveImageUrl } from '@/services/api/imageUrl';
import { useDebouncedValue } from '@/shared/hooks/useDebouncedValue';

// Local fallbacks when a salon has no logo / cover image (exported 1:1 from Figma).
const topLumina = require('@/assets/home/top-lumina.png');
const topAura = require('@/assets/home/top-aura.png');
const fallbackImages = [topLumina, topAura];

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
  // Sort sheet
  overlay: 'rgba(0, 0, 0, 0.4)',
  handle: '#E2E2E2',
  sortMuted: '#5D5F5F',
  sortSelectedBg: 'rgba(233, 30, 99, 0.05)',
  sortSelected: '#E91E63',
  radioIdle: 'rgba(217, 195, 173, 0.5)',
};

const sortOptions = [
  { id: 'popularity', label: 'Popularity', icon: 'flame-outline' as const },
  { id: 'new', label: 'New Arrivals', icon: 'sparkles-outline' as const },
  { id: 'price-low', label: 'Price: Low to High', icon: 'arrow-up-outline' as const },
  { id: 'price-high', label: 'Price: High to Low', icon: 'arrow-down-outline' as const },
  { id: 'top-rated', label: 'Top Rated', icon: 'star-outline' as const },
  { id: 'best-sellers', label: 'Best Sellers', icon: 'trophy-outline' as const },
  { id: 'discount', label: 'Discount', icon: 'pricetag-outline' as const },
  { id: 'favorites', label: 'Customer Favorites', icon: 'heart-outline' as const },
];

type DiscoverNavigation = BottomTabNavigationProp<ClientTabParamList>;

function salonLocation(s: Salon) {
  const parts = [s.city, s.state].filter(Boolean).join(', ');
  if (s.distance_km != null) {
    return parts ? `${parts} • ${s.distance_km.toFixed(1)} km` : `${s.distance_km.toFixed(1)} km`;
  }
  return parts || s.address || 'Location unavailable';
}

export function ClientDiscoverScreen() {
  const navigation = useNavigation<DiscoverNavigation>();
  const parent = navigation.getParent<NativeStackNavigationProp<ClientStackParamList>>();
  const [sortOpen, setSortOpen] = useState(false);
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebouncedValue(query.trim(), 350);
  const isSearching = debouncedQuery.length >= 2;

  const publicSalons = usePublicSalons({ enabled: !isSearching });
  const searchSalons = useSearchSalons({ q: debouncedQuery, enabled: isSearching });

  const active = isSearching ? searchSalons : publicSalons;
  const salons = active.data?.salons ?? [];

  const openSalon = (s: Salon) => {
    const route: SalonRouteData = {
      id: s.id,
      name: s.business_name,
      location: salonLocation(s),
      rating: s.average_rating != null ? String(s.average_rating) : 'New',
      reviewCount: s.total_reviews ?? 0,
      heroImage: s.logo_url ?? s.cover_images?.[0] ?? undefined,
    };
    parent?.navigate('SalonDetails', { salon: route });
  };

  const resultsLabel = active.isLoading
    ? 'Finding salons…'
    : `${salons.length} salon${salons.length === 1 ? '' : 's'} found`;

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
      <MainHeader
        onBack={() => navigation.navigate('Home')}
        onCart={() => navigation.navigate('Shopping')}
      />
      <SearchSection onSort={() => setSortOpen(true)} value={query} onChangeText={setQuery} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.resultsHeader}>
          <Text style={styles.resultsText}>{resultsLabel}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{isSearching ? 'SEARCH RESULTS' : 'ALL SALONS'}</Text>

          {active.isLoading ? (
            <View style={styles.stateBox}>
              <ActivityIndicator color={colors.gold} size="large" />
            </View>
          ) : active.isError ? (
            <View style={styles.stateBox}>
              <Text style={styles.stateText}>Couldn't load salons.</Text>
              <Pressable onPress={() => active.refetch()} style={styles.retryBtn}>
                <Text style={styles.retryText}>Retry</Text>
              </Pressable>
            </View>
          ) : salons.length === 0 ? (
            <View style={styles.stateBox}>
              <Ionicons color={colors.sectionHeading} name="search-outline" size={26} />
              <Text style={styles.stateText}>
                {isSearching ? `No salons match "${debouncedQuery}".` : 'No salons available yet.'}
              </Text>
            </View>
          ) : (
            <View style={styles.list}>
              {salons.map((salon, index) => {
                const remote = resolveImageUrl(salon.logo_url ?? salon.cover_images?.[0]);
                return (
                  <SalonCard
                    key={salon.id}
                    chips={(salon.salon_type ? [salon.salon_type.replace(/_/g, ' ').toUpperCase()] : [])}
                    imageSource={remote ? { uri: remote } : fallbackImages[index % fallbackImages.length]}
                    location={salonLocation(salon)}
                    name={salon.business_name}
                    offer={salon.has_discount ? 'OFFER' : undefined}
                    onPress={() => openSalon(salon)}
                    rating={salon.average_rating != null ? String(salon.average_rating) : 'New'}
                  />
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>

      <SortSheet onClose={() => setSortOpen(false)} visible={sortOpen} />
    </SafeAreaView>
  );
}

function SortSheet({ onClose, visible }: { onClose: () => void; visible: boolean }) {
  const [selected, setSelected] = useState('popularity');

  return (
    <Modal animationType="slide" onRequestClose={onClose} transparent visible={visible}>
      <Pressable onPress={onClose} style={styles.sheetOverlay} />
      <View style={styles.sheet}>
        <View style={styles.sheetHeader}>
          <View style={styles.sheetHandle} />
          <Text style={styles.sheetTitle}>Sort By</Text>
          <Text style={styles.sheetSubtitle}>Choose how you want products to be displayed</Text>
        </View>

        <ScrollView contentContainerStyle={styles.sortList} showsVerticalScrollIndicator={false}>
          {sortOptions.map((option) => {
            const isSelected = option.id === selected;

            return (
              <Pressable
                key={option.id}
                onPress={() => setSelected(option.id)}
                style={[styles.sortRow, isSelected && styles.sortRowSelected]}
              >
                <View style={styles.sortLeft}>
                  <Ionicons
                    color={isSelected ? colors.sortSelected : colors.sortMuted}
                    name={option.icon}
                    size={19}
                  />
                  <Text style={styles.sortLabel}>{option.label}</Text>
                </View>
                <View style={[styles.radio, isSelected && styles.radioSelected]}>
                  {isSelected ? <View style={styles.radioDot} /> : null}
                </View>
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={styles.sheetFooter}>
          <Pressable onPress={onClose}>
            <LinearGradient
              colors={[colors.gold, '#F6A400']}
              end={{ x: 1, y: 0 }}
              start={{ x: 0, y: 0 }}
              style={styles.applyButton}
            >
              <Text style={styles.applyText}>Apply Sorting</Text>
            </LinearGradient>
          </Pressable>
          <Pressable onPress={() => setSelected('popularity')} style={styles.resetButton}>
            <Text style={styles.resetText}>Reset</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

function MainHeader({ onBack, onCart }: { onBack: () => void; onCart: () => void }) {
  return (
    <View style={styles.mainHeader}>
      <View style={styles.mainHeaderLeft}>
        <Pressable onPress={onBack}>
          <Ionicons color={colors.heading} name="arrow-back" size={24} />
        </Pressable>
        <Text style={styles.headerTitle}>Salons</Text>
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

function SearchSection({
  onSort,
  value,
  onChangeText,
}: {
  onSort: () => void;
  value: string;
  onChangeText: (text: string) => void;
}) {
  return (
    <View style={styles.searchSection}>
      <View style={styles.searchInputWrap}>
        <Ionicons color={colors.text} name="search-outline" size={18} />
        <TextInput
          placeholder="Search salons by name..."
          placeholderTextColor={colors.text}
          style={styles.searchInput}
          value={value}
          onChangeText={onChangeText}
          autoCapitalize="none"
          returnKeyType="search"
        />
        {value.length > 0 ? (
          <Pressable hitSlop={8} onPress={() => onChangeText('')}>
            <Ionicons color={colors.text} name="close-circle" size={18} />
          </Pressable>
        ) : null}
      </View>
      <Pressable onPress={onSort} style={styles.filterButton}>
        <Ionicons color={colors.white} name="options-outline" size={16} />
      </Pressable>
    </View>
  );
}

function SalonCard({
  chips,
  imageSource,
  location,
  name,
  offer,
  onPress,
  rating,
}: {
  chips: string[];
  imageSource: ImageSourcePropType;
  location: string;
  name: string;
  offer?: string;
  onPress: () => void;
  rating: string;
}) {
  return (
    <Pressable onPress={onPress} style={styles.card}>
      <View style={styles.imageWrap}>
        <Image source={imageSource} style={styles.cardImage} />

        {offer ? (
          <View style={styles.offerStrip}>
            <Text style={styles.offerStripText}>{offer}</Text>
          </View>
        ) : null}

        <Pressable style={styles.favButton}>
          <Ionicons color={colors.heading} name="heart-outline" size={17} />
        </Pressable>
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

        {chips.length > 0 ? (
          <View style={styles.chipRow}>
            {chips.map((chip) => (
              <View key={chip} style={styles.chip}>
                <Text style={styles.chipText}>{chip}</Text>
              </View>
            ))}
          </View>
        ) : null}
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
  stateBox: {
    alignItems: 'center',
    gap: 12,
    justifyContent: 'center',
    paddingVertical: 48,
  },
  stateText: {
    color: colors.resultsMuted,
    fontFamily: 'Montserrat_500Medium',
    fontSize: 14,
    textAlign: 'center',
  },
  retryBtn: {
    backgroundColor: colors.gold,
    borderRadius: 9999,
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  retryText: {
    color: colors.white,
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 13,
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
  sheetOverlay: {
    backgroundColor: colors.overlay,
    flex: 1,
  },
  sheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    bottom: 0,
    left: 0,
    maxHeight: '85%',
    position: 'absolute',
    right: 0,
  },
  sheetHeader: {
    alignItems: 'center',
    gap: 12,
    paddingBottom: 16,
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  sheetHandle: {
    backgroundColor: colors.handle,
    borderRadius: 12,
    height: 4,
    width: 48,
  },
  sheetTitle: {
    alignSelf: 'stretch',
    color: colors.heading,
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 20,
    letterSpacing: -0.2,
    marginTop: 8,
  },
  sheetSubtitle: {
    alignSelf: 'stretch',
    color: colors.sortMuted,
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    lineHeight: 19.5,
  },
  sortList: {
    gap: 4,
    paddingHorizontal: 16,
  },
  sortRow: {
    alignItems: 'center',
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 16,
  },
  sortRowSelected: {
    backgroundColor: colors.sortSelectedBg,
  },
  sortLeft: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 16,
  },
  sortLabel: {
    color: colors.heading,
    fontFamily: 'Inter_500Medium',
    fontSize: 16,
  },
  radio: {
    alignItems: 'center',
    borderColor: colors.radioIdle,
    borderRadius: 12,
    borderWidth: 2,
    height: 24,
    justifyContent: 'center',
    width: 24,
  },
  radioSelected: {
    backgroundColor: colors.sortSelected,
    borderColor: colors.sortSelected,
  },
  radioDot: {
    backgroundColor: colors.white,
    borderRadius: 4,
    height: 8,
    width: 8,
  },
  sheetFooter: {
    backgroundColor: colors.white,
    gap: 12,
    paddingBottom: 40,
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  applyButton: {
    alignItems: 'center',
    borderRadius: 4,
    paddingVertical: 16,
  },
  applyText: {
    color: colors.white,
    fontFamily: 'Montserrat_400Regular',
    fontSize: 16,
  },
  resetButton: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  resetText: {
    color: colors.sortMuted,
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
  },
});
