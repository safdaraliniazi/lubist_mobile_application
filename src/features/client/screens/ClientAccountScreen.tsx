import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { auraWellness, luminaStudio, theGlowRoom } from '@/features/client/data/salons';
import type {
  ClientStackParamList,
  ClientTabParamList,
  SalonRouteData,
} from '@/navigation/navigation.types';
import { useAuth } from '@/store/AuthContext';
import { useLogout } from '@/services/api/hooks/useAuthAPI';

const topLumina = require('@/assets/home/top-lumina.png');
const topAura = require('@/assets/home/top-aura.png');
const nearbyGlow = require('@/assets/home/nearby-glow.png');
const loreal = require('@/assets/catalog/loreal.png');
const olaplex = require('@/assets/catalog/olaplex.png');
const moroccanoil = require('@/assets/catalog/moroccanoil.png');

const colors = {
  bg: '#FFFAF5',
  white: '#FFFFFF',
  gold: '#F89E07',
  heading: '#221A11',
  text: '#534433',
  muted: '#78716C',
  border: '#E7D7C9',
  tan: '#F0E0D1',
  cardCream2: '#FFF1E6',
  cardBorder: '#F3F4F6',
  chipBg: '#EDE1D2',
  chipUnisex: '#6B6357',
  pillBorder: 'rgba(217, 195, 173, 0.3)',
  onImage: 'rgba(255, 255, 255, 0.9)',
  size: '#9CA3AF',
  sale: '#111827',
  segmentBg: '#F0E0D1',
};

type SavedSalon = {
  id: string;
  data: SalonRouteData;
  image: number;
  location: string;
  chips: string[];
};

const savedSalons: SavedSalon[] = [
  {
    id: 'sv1',
    data: luminaStudio,
    image: topLumina,
    location: 'Downtown Ave • 1.2 km',
    chips: ['UNISEX', 'HAIR & SPA'],
  },
  {
    id: 'sv2',
    data: auraWellness,
    image: topAura,
    location: 'Westside District • 2.5 km',
    chips: ['UNISEX', 'MASSAGE'],
  },
  {
    id: 'sv3',
    data: theGlowRoom,
    image: nearbyGlow,
    location: 'Park Lane • 3.1 km',
    chips: ['UNISEX', 'SKIN'],
  },
];

type SavedProduct = {
  id: string;
  brand: string;
  desc: string;
  size: string;
  price: string;
  image: number;
};

const savedProducts: SavedProduct[] = [
  { id: 'sp1', brand: "L'Oreal Paris", desc: 'Hyaluron Moisture Anti-frizz', size: '1L', price: '₹986', image: loreal },
  { id: 'sp2', brand: 'Olaplex', desc: 'No. 4 Bond Maintenance', size: '250ml', price: '₹2950', image: olaplex },
  { id: 'sp3', brand: 'Moroccanoil', desc: 'Hydrating Shampoo', size: '500ml', price: '₹1850', image: moroccanoil },
  { id: 'sp4', brand: "L'Oreal Paris", desc: 'Hyaluron Moisture Anti-frizz', size: '1L', price: '₹986', image: loreal },
];

type Tab = 'salons' | 'products';
type SavedNavigation = BottomTabNavigationProp<ClientTabParamList>;

export function ClientAccountScreen() {
  const navigation = useNavigation<SavedNavigation>();
  const parent = navigation.getParent<NativeStackNavigationProp<ClientStackParamList>>();
  const [tab, setTab] = useState<Tab>('salons');
  
  const { signOut } = useAuth();
  const { mutate: logoutUser } = useLogout();

  const handleLogout = () => {
    logoutUser(undefined, {
      onSettled: () => {
        signOut();
      }
    });
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Saved</Text>
        <Pressable onPress={handleLogout} style={styles.logoutBtn}>
          <Ionicons color={colors.text} name="log-out-outline" size={20} />
          <Text style={styles.logoutText}>Log out</Text>
        </Pressable>
      </View>

      <View style={styles.segment}>
        <Pressable
          onPress={() => setTab('salons')}
          style={[styles.segmentButton, tab === 'salons' && styles.segmentActive]}
        >
          <Ionicons
            color={tab === 'salons' ? colors.white : colors.text}
            name="heart"
            size={14}
          />
          <Text style={[styles.segmentText, tab === 'salons' && styles.segmentTextActive]}>
            Salons
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setTab('products')}
          style={[styles.segmentButton, tab === 'products' && styles.segmentActive]}
        >
          <Ionicons
            color={tab === 'products' ? colors.white : colors.text}
            name="bag-handle"
            size={14}
          />
          <Text style={[styles.segmentText, tab === 'products' && styles.segmentTextActive]}>
            Products
          </Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {tab === 'salons' ? (
          <View style={styles.salonList}>
            {savedSalons.map((salon) => (
              <Pressable
                key={salon.id}
                onPress={() => parent?.navigate('SalonDetails', { salon: salon.data })}
                style={styles.salonCard}
              >
                <View style={styles.salonImageWrap}>
                  <Image source={salon.image} style={styles.salonImage} />
                  <View style={styles.salonFav}>
                    <Ionicons color={colors.gold} name="heart" size={18} />
                  </View>
                </View>
                <View style={styles.salonContent}>
                  <View style={styles.salonTitleRow}>
                    <Text style={styles.salonName}>{salon.data.name}</Text>
                    <View style={styles.salonRating}>
                      <Ionicons color={colors.gold} name="star" size={12} />
                      <Text style={styles.salonRatingText}>{salon.data.rating}</Text>
                    </View>
                  </View>
                  <View style={styles.salonMeta}>
                    <Ionicons color={colors.text} name="location-outline" size={14} />
                    <Text style={styles.salonMetaText}>{salon.location}</Text>
                  </View>
                  <View style={styles.salonChips}>
                    {salon.chips.map((chip, index) => (
                      <View key={chip} style={styles.salonChip}>
                        <Text style={[styles.salonChipText, index === 0 && styles.salonChipUnisex]}>
                          {chip}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              </Pressable>
            ))}
          </View>
        ) : (
          <View style={styles.grid}>
            {savedProducts.map((product) => (
              <Pressable
                key={product.id}
                onPress={() => parent?.navigate('ProductDetail', { productName: product.brand })}
                style={styles.productCard}
              >
                <View style={styles.productImageWrap}>
                  <Image source={product.image} style={styles.productImage} />
                  <View style={styles.productFav}>
                    <Ionicons color={colors.gold} name="heart" size={14} />
                  </View>
                </View>
                <Text style={styles.productBrand}>{product.brand}</Text>
                <Text style={styles.productDesc}>{product.desc}</Text>
                <Text style={styles.productSize}>{product.size}</Text>
                <Text style={styles.productPrice}>{product.price}</Text>
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.bg,
    flex: 1,
  },
  header: {
    alignItems: 'center',
    backgroundColor: colors.white,
    elevation: 3,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 18,
    shadowColor: 'rgba(248, 158, 7, 0.08)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 20,
  },
  headerTitle: {
    color: colors.heading,
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 22,
    letterSpacing: -0.2,
  },
  logoutBtn: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
  },
  logoutText: {
    color: colors.text,
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
  },
  segment: {
    backgroundColor: colors.segmentBg,
    borderRadius: 14,
    flexDirection: 'row',
    margin: 16,
    padding: 4,
  },
  segmentButton: {
    alignItems: 'center',
    borderRadius: 10,
    flex: 1,
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
    paddingVertical: 10,
  },
  segmentActive: {
    backgroundColor: colors.gold,
  },
  segmentText: {
    color: colors.text,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
  },
  segmentTextActive: {
    color: colors.white,
  },
  scrollContent: {
    paddingBottom: 120,
    paddingHorizontal: 16,
    paddingTop: 4,
  },
  salonList: {
    gap: 16,
  },
  salonCard: {
    backgroundColor: colors.cardCream2,
    borderColor: colors.pillBorder,
    borderRadius: 8,
    borderWidth: 1,
    elevation: 3,
    overflow: 'hidden',
    shadowColor: 'rgba(44, 44, 44, 0.08)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 20,
  },
  salonImageWrap: {
    height: 160,
    position: 'relative',
  },
  salonImage: {
    height: '100%',
    width: '100%',
  },
  salonFav: {
    alignItems: 'center',
    backgroundColor: colors.onImage,
    borderRadius: 12,
    height: 36,
    justifyContent: 'center',
    position: 'absolute',
    right: 12,
    top: 12,
    width: 36,
  },
  salonContent: {
    gap: 8,
    padding: 16,
  },
  salonTitleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  salonName: {
    color: colors.heading,
    flex: 1,
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 20,
    letterSpacing: -0.2,
    paddingRight: 10,
  },
  salonRating: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
  },
  salonRatingText: {
    color: colors.heading,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
  },
  salonMeta: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  salonMetaText: {
    color: colors.text,
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
  },
  salonChips: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  salonChip: {
    backgroundColor: colors.chipBg,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  salonChipText: {
    color: colors.text,
    fontFamily: 'Inter_400Regular',
    fontSize: 10,
    letterSpacing: 0.5,
  },
  salonChipUnisex: {
    color: colors.chipUnisex,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  productCard: {
    borderColor: colors.cardBorder,
    borderRadius: 8,
    borderWidth: 1,
    gap: 2,
    margin: 6,
    padding: 8,
    width: '47%',
  },
  productImageWrap: {
    marginBottom: 6,
    position: 'relative',
  },
  productImage: {
    backgroundColor: colors.tan,
    borderRadius: 6,
    height: 120,
    width: '100%',
  },
  productFav: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 10,
    height: 28,
    justifyContent: 'center',
    position: 'absolute',
    right: 8,
    top: 8,
    width: 28,
  },
  productBrand: {
    color: colors.heading,
    fontFamily: 'Poppins_700Bold',
    fontSize: 12,
  },
  productDesc: {
    color: colors.text,
    fontFamily: 'Inter_400Regular',
    fontSize: 10,
    lineHeight: 14,
  },
  productSize: {
    color: colors.size,
    fontFamily: 'Inter_400Regular',
    fontSize: 10,
    marginTop: 2,
  },
  productPrice: {
    color: colors.sale,
    fontFamily: 'Inter_700Bold',
    fontSize: 13,
    paddingVertical: 4,
  },
});
