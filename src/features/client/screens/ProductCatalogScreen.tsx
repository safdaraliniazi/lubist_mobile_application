import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { ClientStackParamList } from '@/navigation/navigation.types';

const loreal = require('@/assets/catalog/loreal.png');
const olaplex = require('@/assets/catalog/olaplex.png');
const moroccanoil = require('@/assets/catalog/moroccanoil.png');

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

const baseProducts: Product[] = [
  {
    id: 'loreal',
    brand: "L'Oreal Paris",
    desc: 'Hyaluron Moisture Anti-\nfrizz...',
    size: '1L',
    original: '₹1315',
    price: '₹986',
    discount: '25% Off',
    image: loreal,
  },
  {
    id: 'olaplex',
    brand: 'Olaplex',
    desc: 'No. 4 Bond\nMaintenance...',
    size: '250ml',
    price: '₹2950',
    image: olaplex,
  },
  {
    id: 'moroccanoil',
    brand: 'Moroccanoil',
    desc: 'Hydrating Shampoo for\nall hair types...',
    size: '500ml',
    price: '₹1850',
    image: moroccanoil,
  },
];

const products: Product[] = baseProducts.flatMap((product, index) => [
  product,
  { ...product, id: `${product.id}-${index}-b` },
]);

const offers = [
  { id: 'o1', title: 'Flat 10% OFF', subtitle: 'On all services with online payment.' },
  { id: 'o2', title: 'Flat 10% OFF', subtitle: 'On all services with online payment.' },
];

const colors = {
  bg: '#FFFAF5',
  white: '#FFFFFF',
  border: '#F3F4F6',
  heading: '#221A11',
  text: '#534433',
  gold: '#F89E07',
  orange: '#F97316',
  searchBorder: '#E7D7C9',
  placeholder: 'rgba(83, 68, 51, 0.5)',
  size: '#9CA3AF',
  strike: '#9E9E9E',
  sale: '#111827',
  discount: '#27AE60',
  offerBorder: 'rgba(248, 158, 7, 0.2)',
  offerTitle: '#2C2C2C',
  card: '#FFF6EC',
};

type Navigation = NativeStackNavigationProp<ClientStackParamList>;
type Route = RouteProp<ClientStackParamList, 'ProductCatalog'>;

export function ProductCatalogScreen() {
  const navigation = useNavigation<Navigation>();
  const route = useRoute<Route>();
  const title = route.params?.category ?? 'Shampoo';

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Pressable onPress={() => navigation.goBack()}>
            <Ionicons color={colors.heading} name="arrow-back" size={24} />
          </Pressable>
          <Text style={styles.headerTitle}>{title}</Text>
        </View>
        <Pressable onPress={() => navigation.navigate('Cart')} style={styles.cartWrap}>
          <Ionicons color={colors.heading} name="cart-outline" size={24} />
          <View style={styles.cartBadge}>
            <Text style={styles.cartBadgeText}>4</Text>
          </View>
        </Pressable>
      </View>

      <View style={styles.searchSection}>
        <View style={styles.searchInput}>
          <Ionicons color={colors.text} name="search-outline" size={18} />
          <TextInput
            placeholder="Search salons, services..."
            placeholderTextColor={colors.placeholder}
            style={styles.searchText}
          />
        </View>
        <Pressable style={styles.filterButton}>
          <Ionicons color={colors.white} name="options-outline" size={16} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>CURRENT OFFERS</Text>
        <ScrollView
          contentContainerStyle={styles.offersRow}
          horizontal
          showsHorizontalScrollIndicator={false}
        >
          {offers.map((offer) => (
            <LinearGradient
              key={offer.id}
              colors={[colors.card, '#FCEBDC']}
              end={{ x: 0.2, y: 1 }}
              start={{ x: 0, y: 0 }}
              style={styles.offerCard}
            >
              <View style={styles.offerTopRow}>
                <Ionicons color={colors.gold} name="pricetag" size={14} />
                <Text style={styles.offerTitle}>{offer.title}</Text>
              </View>
              <Text style={styles.offerSubtitle}>{offer.subtitle}</Text>
            </LinearGradient>
          ))}
        </ScrollView>

        <Text style={[styles.sectionTitle, styles.productsHeading]}>OUR PRODUCTS</Text>
        <View style={styles.grid}>
          {products.map((product) => (
            <Pressable
              key={product.id}
              onPress={() => navigation.navigate('ProductDetail', { productName: product.brand })}
              style={styles.card}
            >
              <Image source={product.image} style={styles.productImage} />
              <Text style={styles.productBrand}>{product.brand}</Text>
              <Text style={styles.productDesc}>{product.desc}</Text>
              <Text style={styles.productSize}>{product.size}</Text>

              <View style={styles.priceRow}>
                {product.original ? (
                  <Text style={styles.priceOriginal}>{product.original}</Text>
                ) : null}
                <Text style={styles.priceSale}>{product.price}</Text>
                {product.discount ? (
                  <Text style={styles.priceDiscount}>{product.discount}</Text>
                ) : null}
              </View>

              <Pressable style={styles.addButton}>
                <Text style={styles.addText}>Add</Text>
                <Ionicons color={colors.white} name="bag-add-outline" size={11} />
              </Pressable>
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
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 14,
  },
  headerLeft: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 16,
  },
  headerTitle: {
    color: colors.heading,
    fontFamily: 'Montserrat_700Bold',
    fontSize: 20,
    letterSpacing: -0.5,
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
    paddingTop: 8,
    shadowColor: 'rgba(0, 0, 0, 0.05)',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 2,
  },
  searchInput: {
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
  searchText: {
    color: colors.text,
    flex: 1,
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
  },
  filterButton: {
    alignItems: 'center',
    backgroundColor: colors.orange,
    borderRadius: 9999,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  scrollContent: {
    paddingBottom: 40,
    paddingTop: 20,
  },
  sectionTitle: {
    color: colors.text,
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    letterSpacing: 1.1,
    paddingHorizontal: 20,
  },
  offersRow: {
    gap: 16,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  offerCard: {
    borderColor: colors.offerBorder,
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
    padding: 12,
    width: 220,
  },
  offerTopRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  offerTitle: {
    color: colors.offerTitle,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
  },
  offerSubtitle: {
    color: colors.text,
    fontFamily: 'Inter_300Light',
    fontSize: 10,
    lineHeight: 14.4,
  },
  productsHeading: {
    marginTop: 28,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 8,
    paddingTop: 12,
  },
  card: {
    borderColor: colors.border,
    borderWidth: 1,
    gap: 2,
    padding: 8,
    width: '33.333%',
  },
  productImage: {
    backgroundColor: colors.card,
    borderRadius: 6,
    height: 96,
    marginBottom: 6,
    width: '100%',
  },
  productBrand: {
    color: colors.heading,
    fontFamily: 'Poppins_700Bold',
    fontSize: 11,
  },
  productDesc: {
    color: colors.text,
    fontFamily: 'Inter_400Regular',
    fontSize: 9,
    lineHeight: 13.5,
  },
  productSize: {
    color: colors.size,
    fontFamily: 'Inter_400Regular',
    fontSize: 9,
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
    fontSize: 10,
    textDecorationLine: 'line-through',
  },
  priceSale: {
    color: colors.sale,
    fontFamily: 'Inter_700Bold',
    fontSize: 10,
  },
  priceDiscount: {
    color: colors.discount,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 9,
  },
  addButton: {
    alignItems: 'center',
    backgroundColor: colors.gold,
    borderRadius: 4,
    flexDirection: 'row',
    gap: 4,
    justifyContent: 'center',
    marginTop: 4,
    paddingVertical: 6,
  },
  addText: {
    color: colors.white,
    fontFamily: 'Montserrat_700Bold',
    fontSize: 9,
  },
});
