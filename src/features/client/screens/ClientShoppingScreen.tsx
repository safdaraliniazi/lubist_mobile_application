import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { ClientStackParamList, ClientTabParamList } from '@/navigation/navigation.types';

const brandHaircare = require('@/assets/home/brand-haircare.png');
const brandSkincare = require('@/assets/home/brand-skincare.png');
const brandMakeup = require('@/assets/home/brand-makeup.png');
const loreal = require('@/assets/catalog/loreal.png');
const olaplex = require('@/assets/catalog/olaplex.png');
const moroccanoil = require('@/assets/catalog/moroccanoil.png');

const colors = {
  bg: '#FFFAF5',
  white: '#FFFFFF',
  gold: '#F89E07',
  heading: '#221A11',
  text: '#534433',
  muted2: '#867461',
  border: '#E7D7C9',
  tan: '#F0E0D1',
  cardCream: '#FFF6EC',
  offerBorder: 'rgba(248, 158, 7, 0.2)',
  offerDark: '#2C2C2C',
  cardBorder: '#F3F4F6',
  size: '#9CA3AF',
  strike: '#9E9E9E',
  sale: '#111827',
  discount: '#27AE60',
  placeholder: 'rgba(83, 68, 51, 0.5)',
};

type Category = { id: string; label: string; image?: number; icon?: keyof typeof Ionicons.glyphMap };

const categories: Category[] = [
  { id: 'c1', label: 'Haircare', image: brandHaircare },
  { id: 'c2', label: 'Skincare', image: brandSkincare },
  { id: 'c3', label: 'Makeup', image: brandMakeup },
  { id: 'c4', label: 'Bath&Body', icon: 'flower-outline' },
];

const offers = [
  { id: 'o1', title: 'Flat 10% OFF', subtitle: 'On all products with online payment.' },
  { id: 'o2', title: 'Buy 2 Get 1', subtitle: 'On select haircare essentials.' },
];

type Product = {
  id: string;
  brand: string;
  desc: string;
  size: string;
  price: string;
  original?: string;
  discount?: string;
  image: number;
};

const products: Product[] = [
  {
    id: 'p1',
    brand: "L'Oreal Paris",
    desc: 'Hyaluron Moisture Anti-\nfrizz...',
    size: '1L',
    original: '₹1315',
    price: '₹986',
    discount: '25% Off',
    image: loreal,
  },
  { id: 'p2', brand: 'Olaplex', desc: 'No. 4 Bond\nMaintenance...', size: '250ml', price: '₹2950', image: olaplex },
  {
    id: 'p3',
    brand: 'Moroccanoil',
    desc: 'Hydrating Shampoo for\nall hair types...',
    size: '500ml',
    price: '₹1850',
    image: moroccanoil,
  },
  {
    id: 'p4',
    brand: "L'Oreal Paris",
    desc: 'Hyaluron Moisture Anti-\nfrizz...',
    size: '1L',
    original: '₹1315',
    price: '₹986',
    discount: '25% Off',
    image: loreal,
  },
];

type ShoppingNavigation = BottomTabNavigationProp<ClientTabParamList>;

export function ClientShoppingScreen() {
  const navigation = useNavigation<ShoppingNavigation>();
  const parent = navigation.getParent<NativeStackNavigationProp<ClientStackParamList>>();
  const openCatalog = (category: string) => parent?.navigate('ProductCatalog', { category });
  const openProduct = (productName: string) => parent?.navigate('ProductDetail', { productName });

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Shopping</Text>
        <Pressable onPress={() => parent?.navigate('Cart')} style={styles.cartWrap}>
          <Ionicons color={colors.heading} name="cart-outline" size={24} />
          <View style={styles.cartBadge}>
            <Text style={styles.cartBadgeText}>4</Text>
          </View>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.searchBar}>
          <Ionicons color={colors.placeholder} name="search-outline" size={20} />
          <TextInput
            placeholder="Search products, brands..."
            placeholderTextColor={colors.placeholder}
            style={styles.searchInput}
          />
        </View>

        <Text style={styles.sectionTitle}>SHOP BY CATEGORY</Text>
        <View style={styles.categoriesRow}>
          {categories.map((item) => (
            <Pressable key={item.id} onPress={() => openCatalog(item.label)} style={styles.categoryItem}>
              <View style={styles.categoryCircle}>
                {item.image ? (
                  <Image source={item.image} style={styles.categoryImage} />
                ) : item.icon ? (
                  <Ionicons color={colors.muted2} name={item.icon} size={24} />
                ) : null}
              </View>
              <Text style={styles.categoryLabel}>{item.label}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={[styles.sectionTitle, styles.sectionSpaced]}>CURRENT OFFERS</Text>
        <ScrollView
          contentContainerStyle={styles.offersRow}
          horizontal
          showsHorizontalScrollIndicator={false}
        >
          {offers.map((offer) => (
            <LinearGradient
              key={offer.id}
              colors={[colors.cardCream, '#FCEBDC']}
              end={{ x: 0.2, y: 1 }}
              start={{ x: 0, y: 0 }}
              style={styles.offerCard}
            >
              <View style={styles.offerTopRow}>
                <View style={styles.offerIcon}>
                  <Ionicons color={colors.gold} name="pricetag" size={14} />
                </View>
                <Text style={styles.offerTitle}>{offer.title}</Text>
              </View>
              <Text style={styles.offerSubtitle}>{offer.subtitle}</Text>
            </LinearGradient>
          ))}
        </ScrollView>

        <View style={[styles.sectionHeaderRow, styles.sectionSpaced]}>
          <Text style={styles.sectionTitle}>TRENDING NOW</Text>
          <Pressable onPress={() => openCatalog('Trending')} style={styles.seeAll}>
            <Text style={styles.seeAllText}>SEE ALL </Text>
            <Ionicons color={colors.gold} name="chevron-forward" size={12} />
          </Pressable>
        </View>

        <View style={styles.grid}>
          {products.map((product) => (
            <Pressable
              key={product.id}
              onPress={() => openProduct(product.brand)}
              style={styles.card}
            >
              <Image source={product.image} style={styles.productImage} />
              <Text style={styles.productBrand}>{product.brand}</Text>
              <Text style={styles.productDesc}>{product.desc}</Text>
              <Text style={styles.productSize}>{product.size}</Text>
              <View style={styles.priceRow}>
                {product.original ? <Text style={styles.priceOriginal}>{product.original}</Text> : null}
                <Text style={styles.priceSale}>{product.price}</Text>
                {product.discount ? <Text style={styles.priceDiscount}>{product.discount}</Text> : null}
              </View>
              <View style={styles.addButton}>
                <Text style={styles.addText}>Add</Text>
                <Ionicons color={colors.white} name="bag-add-outline" size={11} />
              </View>
            </Pressable>
          ))}
        </View>
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
  scrollContent: {
    paddingBottom: 120,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  searchBar: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: 20,
    borderWidth: 1,
    elevation: 2,
    flexDirection: 'row',
    gap: 12,
    height: 48,
    paddingHorizontal: 16,
    shadowColor: 'rgba(44, 44, 44, 0.08)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 20,
  },
  searchInput: {
    color: colors.text,
    flex: 1,
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
  },
  sectionTitle: {
    color: colors.text,
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    letterSpacing: 1.1,
  },
  sectionSpaced: {
    marginTop: 28,
  },
  sectionHeaderRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  seeAll: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  seeAllText: {
    color: colors.gold,
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    letterSpacing: 0.7,
  },
  categoriesRow: {
    flexDirection: 'row',
    gap: 16,
    justifyContent: 'space-between',
    marginTop: 16,
  },
  categoryItem: {
    alignItems: 'center',
    gap: 8,
  },
  categoryCircle: {
    alignItems: 'center',
    backgroundColor: colors.tan,
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: 1,
    height: 64,
    justifyContent: 'center',
    overflow: 'hidden',
    width: 64,
  },
  categoryImage: {
    height: 40,
    width: 40,
  },
  categoryLabel: {
    color: colors.text,
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
  },
  offersRow: {
    gap: 12,
    marginTop: 14,
    paddingRight: 8,
  },
  offerCard: {
    borderColor: colors.offerBorder,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
    justifyContent: 'center',
    minHeight: 52,
    paddingHorizontal: 12,
    paddingVertical: 8,
    width: 220,
  },
  offerTopRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  offerIcon: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 8,
    height: 24,
    justifyContent: 'center',
    width: 24,
  },
  offerTitle: {
    color: colors.offerDark,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
  },
  offerSubtitle: {
    color: colors.text,
    fontFamily: 'Inter_300Light',
    fontSize: 10,
    lineHeight: 14.4,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
    marginTop: 14,
  },
  card: {
    borderColor: colors.cardBorder,
    borderRadius: 8,
    borderWidth: 1,
    gap: 2,
    margin: 6,
    padding: 8,
    width: '47%',
  },
  productImage: {
    backgroundColor: colors.cardCream,
    borderRadius: 6,
    height: 120,
    marginBottom: 6,
    width: '100%',
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
  priceRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    paddingVertical: 4,
  },
  priceOriginal: {
    color: colors.strike,
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    textDecorationLine: 'line-through',
  },
  priceSale: {
    color: colors.sale,
    fontFamily: 'Inter_700Bold',
    fontSize: 11,
  },
  priceDiscount: {
    color: colors.discount,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 10,
  },
  addButton: {
    alignItems: 'center',
    backgroundColor: colors.gold,
    borderRadius: 4,
    flexDirection: 'row',
    gap: 4,
    justifyContent: 'center',
    marginTop: 4,
    paddingVertical: 7,
  },
  addText: {
    color: colors.white,
    fontFamily: 'Montserrat_700Bold',
    fontSize: 10,
  },
});
