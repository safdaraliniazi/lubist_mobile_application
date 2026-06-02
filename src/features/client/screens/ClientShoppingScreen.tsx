import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const products = [
  {
    id: 'shop-1',
    title: 'Hair ritual kit',
    subtitle: 'Premium cleansing, treatment, and finishing essentials.',
  },
  {
    id: 'shop-2',
    title: 'Spa-at-home edit',
    subtitle: 'Candles, masks, oils, and body care recommended by salons.',
  },
];

export function ClientShoppingScreen() {
  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Shopping</Text>
        <Text style={styles.subtitle}>
          Explore premium salon products and wellness essentials from partner brands.
        </Text>

        {products.map((product) => (
          <View key={product.id} style={styles.card}>
            <View style={styles.iconWrap}>
              <Ionicons color="#bf7021" name="bag-handle-outline" size={20} />
            </View>
            <Text style={styles.cardTitle}>{product.title}</Text>
            <Text style={styles.cardSubtitle}>{product.subtitle}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#f7f0e8',
    flex: 1,
  },
  content: {
    paddingBottom: 112,
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  title: {
    color: '#2f221a',
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 8,
  },
  subtitle: {
    color: '#7d6d63',
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#fffaf4',
    borderColor: '#eadccf',
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 14,
    padding: 18,
  },
  iconWrap: {
    alignItems: 'center',
    backgroundColor: '#fde9d6',
    borderRadius: 14,
    height: 38,
    justifyContent: 'center',
    marginBottom: 12,
    width: 38,
  },
  cardTitle: {
    color: '#2f221a',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
  },
  cardSubtitle: {
    color: '#7d6d63',
    fontSize: 14,
    lineHeight: 21,
  },
});
