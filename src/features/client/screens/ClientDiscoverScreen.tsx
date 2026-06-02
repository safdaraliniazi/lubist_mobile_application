import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { discoverSalons } from '@/features/client/data/salons';
import type { ClientStackParamList, ClientTabParamList, SalonRouteData } from '@/navigation/navigation.types';

const colors = {
  background: '#f7f0e8',
  surface: '#fffaf4',
  surfaceStrong: '#fffdf8',
  text: '#2f221a',
  muted: '#7d6d63',
  subtle: '#a89182',
  border: '#eadccf',
  gold: '#d88a37',
  goldDark: '#bf7021',
  chip: '#eee4d9',
  chipText: '#5f534b',
  white: '#ffffff',
};

const categories = ['All', 'Hair', 'Nails', 'Skin', 'Spa'] as const;

export function ClientDiscoverScreen() {
  const navigation = useNavigation<BottomTabNavigationProp<ClientTabParamList>>();
  const parentNavigation =
    navigation.getParent<NativeStackNavigationProp<ClientStackParamList>>();

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
      <View style={styles.screen}>
        <DiscoverHeader onBackPress={() => navigation.navigate('Home')} />

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <CategoryChips />
          <ResultSummary />

          <Text style={styles.sectionTitle}>SALONS NEAR YOU</Text>

          <View style={styles.list}>
            {discoverSalons.map((salon) => (
              <SalonCard
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

function DiscoverHeader({ onBackPress }: { onBackPress: () => void }) {
  return (
    <View style={styles.header}>
      <Pressable onPress={onBackPress} style={styles.circleButton}>
        <Ionicons color={colors.text} name="arrow-back" size={18} />
      </Pressable>

      <View style={styles.searchBar}>
        <Ionicons color={colors.subtle} name="search-outline" size={18} />
        <TextInput
          placeholder="Search salons, services..."
          placeholderTextColor={colors.subtle}
          style={styles.searchInput}
        />
      </View>

      <Pressable style={styles.filterButton}>
        <Ionicons color={colors.white} name="options-outline" size={18} />
      </Pressable>
    </View>
  );
}

function CategoryChips() {
  return (
    <ScrollView
      contentContainerStyle={styles.categoryRow}
      horizontal
      showsHorizontalScrollIndicator={false}
    >
      {categories.map((category) => {
        const isActive = category === 'All';

        return (
          <View key={category} style={[styles.categoryChip, isActive && styles.categoryChipActive]}>
            <Text
              style={[
                styles.categoryChipText,
                isActive && styles.categoryChipTextActive,
              ]}
            >
              {category}
            </Text>
          </View>
        );
      })}
    </ScrollView>
  );
}

function ResultSummary() {
  return (
    <View style={styles.summaryRow}>
      <Text style={styles.summaryText}>4 salons found</Text>

      <Pressable style={styles.mapViewButton}>
        <Ionicons color={colors.goldDark} name="location-outline" size={15} />
        <Text style={styles.mapViewButtonText}>Map View</Text>
      </Pressable>
    </View>
  );
}

function SalonCard({ onPress, salon }: { onPress: () => void; salon: SalonRouteData }) {
  return (
    <Pressable onPress={onPress} style={styles.card}>
      <View style={styles.imageWrap}>
        <Image source={{ uri: salon.heroImage }} style={styles.cardImage} />

        <View style={styles.offerBadge}>
          <Text style={styles.offerBadgeText}>{salon.badge}</Text>
        </View>

        <Pressable style={styles.cartButton}>
          <Ionicons color={colors.goldDark} name="bag-handle-outline" size={17} />
        </Pressable>

        <View style={styles.imageDots}>
          <View style={[styles.imageDot, styles.imageDotActive]} />
          <View style={styles.imageDot} />
          <View style={styles.imageDot} />
        </View>
      </View>

      <View style={styles.cardContent}>
        <View style={styles.cardTitleRow}>
          <Text style={styles.cardTitle}>{salon.name}</Text>
          <Text style={styles.ratingText}>★ {salon.rating}</Text>
        </View>

        <View style={styles.locationRow}>
          <Ionicons color={colors.muted} name="location-outline" size={14} />
          <Text style={styles.locationText}>
            {salon.location} • {salon.distance}
          </Text>
        </View>

        <View style={styles.cardChipRow}>
          {salon.chips?.map((chip) => (
            <View key={chip} style={styles.cardChip}>
              <Text style={styles.cardChipText}>{chip}</Text>
            </View>
          ))}
        </View>
      </View>
    </Pressable>
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
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  circleButton: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 22,
    borderWidth: 1,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  searchBar: {
    alignItems: 'center',
    backgroundColor: colors.surfaceStrong,
    borderColor: colors.border,
    borderRadius: 22,
    borderWidth: 1,
    flex: 1,
    flexDirection: 'row',
    height: 44,
    paddingHorizontal: 14,
  },
  searchInput: {
    color: colors.text,
    flex: 1,
    fontSize: 14,
    marginLeft: 8,
  },
  filterButton: {
    alignItems: 'center',
    backgroundColor: colors.gold,
    borderRadius: 22,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  content: {
    paddingBottom: 112,
    paddingHorizontal: 20,
    paddingTop: 18,
  },
  categoryRow: {
    gap: 10,
    paddingRight: 12,
  },
  categoryChip: {
    backgroundColor: colors.chip,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  categoryChipActive: {
    backgroundColor: colors.gold,
  },
  categoryChipText: {
    color: colors.chipText,
    fontSize: 13,
    fontWeight: '600',
  },
  categoryChipTextActive: {
    color: colors.white,
  },
  summaryRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 18,
    marginTop: 18,
  },
  summaryText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  mapViewButton: {
    alignItems: 'center',
    backgroundColor: '#fde9d6',
    borderRadius: 16,
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  mapViewButtonText: {
    color: colors.goldDark,
    fontSize: 12.5,
    fontWeight: '700',
  },
  sectionTitle: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1.4,
    marginBottom: 14,
  },
  list: {
    gap: 16,
  },
  card: {
    backgroundColor: colors.surfaceStrong,
    borderColor: colors.border,
    borderRadius: 18,
    borderWidth: 1,
    elevation: 6,
    overflow: 'hidden',
    shadowColor: '#c0a995',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
  },
  imageWrap: {
    height: 166,
    position: 'relative',
  },
  cardImage: {
    height: '100%',
    width: '100%',
  },
  offerBadge: {
    backgroundColor: colors.goldDark,
    borderBottomRightRadius: 14,
    borderTopLeftRadius: 18,
    left: 0,
    paddingHorizontal: 14,
    paddingVertical: 8,
    position: 'absolute',
    top: 0,
  },
  offerBadgeText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '800',
  },
  cartButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 250, 244, 0.95)',
    borderRadius: 18,
    height: 36,
    justifyContent: 'center',
    position: 'absolute',
    right: 14,
    top: 14,
    width: 36,
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
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderRadius: 4,
    height: 7,
    width: 7,
  },
  imageDotActive: {
    backgroundColor: colors.white,
    width: 18,
  },
  cardContent: {
    padding: 16,
  },
  cardTitleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  cardTitle: {
    color: colors.text,
    flex: 1,
    fontSize: 18,
    fontWeight: '800',
    paddingRight: 10,
  },
  ratingText: {
    color: colors.goldDark,
    fontSize: 14,
    fontWeight: '700',
  },
  locationRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  locationText: {
    color: colors.muted,
    fontSize: 13,
  },
  cardChipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 14,
  },
  cardChip: {
    backgroundColor: '#f2e5d8',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  cardChipText: {
    color: colors.text,
    fontSize: 11.5,
    fontWeight: '700',
  },
});
