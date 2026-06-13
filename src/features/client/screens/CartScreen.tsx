import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { ClientStackParamList } from '@/navigation/navigation.types';
import { resolveImageUrl } from '@/services/api/imageUrl';
import {
  formatPrice,
  useProductCart,
  useRemoveProductCartItem,
  useUpdateProductCartItem,
} from '@/services/api/hooks/useProductsAPI';

const productFallback = require('@/assets/product/shampoo-hero.png');

const payments = [
  { id: 'upi', label: 'UPI (Google Pay/PhonePe)', icon: 'phone-portrait-outline' as const },
  { id: 'card', label: 'Credit / Debit Card', icon: 'card-outline' as const },
  { id: 'apple', label: 'Apple Pay', icon: 'logo-apple' as const },
];

const colors = {
  bg: '#FFF8F4',
  white: '#FFFFFF',
  headerBg: 'rgba(245, 233, 218, 0.95)',
  backBtn: '#FFF1E6',
  heading: '#221A11',
  muted: '#534433',
  iconMuted: '#867461',
  border: '#D9C3AD',
  lightBorder: '#F0E0D1',
  gold: '#F89E07',
  upiIcon: '#A66804',
  green: '#2E7D32',
  inputBg: '#FFF8F4',
  edit: 'rgba(83, 68, 51, 0.7)',
  priceCard: 'rgba(255, 255, 255, 0.7)',
};

type Navigation = NativeStackNavigationProp<ClientStackParamList>;

export function CartScreen() {
  const navigation = useNavigation<Navigation>();
  const [payment, setPayment] = useState('upi');

  const cartQuery = useProductCart();
  const updateItem = useUpdateProductCartItem();
  const removeItem = useRemoveProductCartItem();

  const items = cartQuery.data?.items ?? [];
  const totalAmount = cartQuery.data?.total_amount ?? 0;
  const itemCount = cartQuery.data?.item_count ?? 0;

  // Backend clamps to available stock and removes the line at qty 0.
  const changeQty = (itemId: string, current: number, delta: number) =>
    updateItem.mutate({ itemId, quantity: Math.max(1, current + delta) });

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons color={colors.heading} name="arrow-back" size={18} />
        </Pressable>
        <Text style={styles.headerTitle}>Checkout</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionLabel}>YOUR BAG ({itemCount})</Text>

        {cartQuery.isLoading ? (
          <ActivityIndicator color={colors.gold} size="large" style={styles.loader} />
        ) : cartQuery.isError ? (
          <Text style={styles.emptyText}>Couldn’t load your cart. Please try again.</Text>
        ) : items.length === 0 ? (
          <Text style={styles.emptyText}>Your bag is empty.</Text>
        ) : (
          <View style={styles.itemsList}>
            {items.map((item) => {
              const uri = resolveImageUrl(item.image_url ?? item.image_urls?.[0] ?? null);
              return (
                <View key={item.id} style={styles.itemCard}>
                  <View style={styles.itemThumb}>
                    <Image
                      resizeMode="contain"
                      source={uri ? { uri } : productFallback}
                      style={styles.itemImage}
                    />
                  </View>

                  <View style={styles.itemBody}>
                    <View style={styles.itemTitleRow}>
                      <Text style={styles.itemName}>{item.name ?? 'Product'}</Text>
                      <Pressable
                        disabled={removeItem.isPending}
                        onPress={() => removeItem.mutate(item.id)}
                      >
                        <Ionicons color={colors.iconMuted} name="close" size={18} />
                      </Pressable>
                    </View>

                    <View style={styles.itemBottomRow}>
                      <View style={styles.itemPriceWrap}>
                        <Text style={styles.itemPrice}>{formatPrice(item.total)}</Text>
                        <Text style={styles.itemSize}>
                          {formatPrice(item.price)} each
                        </Text>
                      </View>

                      <View style={styles.stepper}>
                        <Pressable
                          disabled={updateItem.isPending || item.quantity <= 1}
                          onPress={() => changeQty(item.id, item.quantity, -1)}
                          style={styles.stepperButton}
                        >
                          <Ionicons color={colors.heading} name="remove" size={14} />
                        </Pressable>
                        <Text style={styles.stepperValue}>{item.quantity}</Text>
                        <Pressable
                          disabled={updateItem.isPending}
                          onPress={() => changeQty(item.id, item.quantity, 1)}
                          style={styles.stepperButton}
                        >
                          <Ionicons color={colors.heading} name="add" size={14} />
                        </Pressable>
                      </View>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        <View style={styles.couponCard}>
          <View style={styles.couponHeader}>
            <Ionicons color={colors.gold} name="pricetag-outline" size={16} />
            <Text style={styles.couponTitle}>APPLY COUPON</Text>
          </View>
          <View style={styles.couponRow}>
            <View style={styles.couponInput}>
              <TextInput
                defaultValue="WELCOME20"
                placeholderTextColor={colors.iconMuted}
                style={styles.couponInputText}
              />
            </View>
            <Pressable style={styles.couponApply}>
              <Text style={styles.couponApplyText}>Apply</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.deliveryCard}>
          <View style={styles.deliveryHeader}>
            <Text style={styles.sectionLabelDark}>DELIVERY TO</Text>
            <Pressable>
              <Text style={styles.editText}>Edit</Text>
            </Pressable>
          </View>
          <View style={styles.deliveryBody}>
            <Ionicons color={colors.iconMuted} name="location-outline" size={18} style={styles.deliveryPin} />
            <View style={styles.deliveryText}>
              <Text style={styles.deliveryName}>Home</Text>
              <Text style={styles.deliveryAddress}>123 Beauty Lane, NY 10001</Text>
              <View style={styles.deliveryEta}>
                <Ionicons color={colors.green} name="time-outline" size={13} />
                <Text style={styles.deliveryEtaText}>Expected by 28 May</Text>
              </View>
            </View>
          </View>
        </View>

        <Text style={styles.sectionLabel}>PAYMENT METHOD</Text>
        <View style={styles.paymentList}>
          {payments.map((option) => {
            const isSelected = option.id === payment;

            return (
              <Pressable
                key={option.id}
                onPress={() => setPayment(option.id)}
                style={[styles.paymentRow, isSelected && styles.paymentRowSelected]}
              >
                <View style={styles.paymentLeft}>
                  <Ionicons
                    color={isSelected ? colors.upiIcon : colors.iconMuted}
                    name={option.icon}
                    size={18}
                  />
                  <Text style={styles.paymentLabel}>{option.label}</Text>
                </View>
                <View style={[styles.radio, isSelected && styles.radioSelected]}>
                  {isSelected ? <View style={styles.radioDot} /> : null}
                </View>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.priceCard}>
          <Text style={styles.sectionLabelDark}>PRICE DETAILS</Text>
          <View style={styles.priceRows}>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Subtotal ({itemCount} items)</Text>
              <Text style={styles.priceValue}>{formatPrice(totalAmount)}</Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Delivery Fee</Text>
              <Text style={styles.priceFree}>Free</Text>
            </View>
            <View style={styles.priceDivider} />
            <View style={styles.priceRow}>
              <Text style={styles.totalLabel}>Total Amount</Text>
              <Text style={styles.totalValue}>{formatPrice(totalAmount)}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.ctaShell}>
        <Pressable disabled={items.length === 0} onPress={() => navigation.navigate('Tabs')}>
          <LinearGradient
            colors={['#D7A797', colors.gold]}
            end={{ x: 0.3, y: 1 }}
            start={{ x: 0, y: 0 }}
            style={[styles.ctaButton, items.length === 0 && styles.ctaButtonDisabled]}
          >
            <Text style={styles.ctaText}>Proceed to Checkout</Text>
            <Ionicons color={colors.white} name="arrow-forward" size={18} />
          </LinearGradient>
        </Pressable>
      </View>
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
    backgroundColor: colors.headerBg,
    flexDirection: 'row',
    gap: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    alignItems: 'center',
    backgroundColor: colors.backBtn,
    borderRadius: 12,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  headerTitle: {
    color: colors.heading,
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 22,
    letterSpacing: -0.44,
  },
  scrollContent: {
    gap: 20,
    paddingBottom: 130,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  sectionLabel: {
    color: colors.muted,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    letterSpacing: 0.5,
  },
  sectionLabelDark: {
    color: colors.heading,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    letterSpacing: 0.5,
  },
  loader: {
    marginTop: 32,
  },
  emptyText: {
    color: colors.muted,
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    marginTop: 24,
    textAlign: 'center',
  },
  itemsList: {
    gap: 12,
    marginTop: -8,
  },
  itemCard: {
    backgroundColor: colors.white,
    borderRadius: 4,
    elevation: 2,
    flexDirection: 'row',
    gap: 12,
    overflow: 'hidden',
    padding: 8,
    shadowColor: 'rgba(44, 44, 44, 0.06)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 10,
  },
  itemThumb: {
    backgroundColor: colors.lightBorder,
    borderRadius: 4,
    height: 96,
    overflow: 'hidden',
    width: 80,
  },
  itemImage: {
    height: '100%',
    width: '100%',
  },
  itemBody: {
    flex: 1,
    paddingVertical: 2,
  },
  itemTitleRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  itemName: {
    color: colors.heading,
    flex: 1,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    paddingRight: 8,
  },
  itemSize: {
    color: colors.muted,
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    marginTop: 2,
  },
  itemBottomRow: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  itemPriceWrap: {
    gap: 2,
  },
  itemPrice: {
    color: colors.heading,
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 18,
  },
  itemPriceSub: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  itemOriginal: {
    color: colors.iconMuted,
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    textDecorationLine: 'line-through',
  },
  itemDiscount: {
    color: colors.gold,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
  },
  stepper: {
    alignItems: 'center',
    backgroundColor: colors.inputBg,
    borderColor: colors.border,
    borderRadius: 4,
    borderWidth: 1,
    flexDirection: 'row',
  },
  stepperButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  stepperValue: {
    color: colors.heading,
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    minWidth: 20,
    textAlign: 'center',
  },
  couponCard: {
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: 4,
    borderStyle: 'dashed',
    borderWidth: 1,
    gap: 12,
    padding: 16,
  },
  couponHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  couponTitle: {
    color: colors.heading,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    letterSpacing: 0.5,
  },
  couponRow: {
    flexDirection: 'row',
    gap: 8,
  },
  couponInput: {
    backgroundColor: colors.inputBg,
    borderColor: colors.border,
    borderRadius: 4,
    borderWidth: 1,
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  couponInputText: {
    color: colors.heading,
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    paddingVertical: 10,
  },
  couponApply: {
    alignItems: 'center',
    borderColor: colors.gold,
    borderRadius: 4,
    borderWidth: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  couponApplyText: {
    color: colors.gold,
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
  },
  deliveryCard: {
    backgroundColor: colors.white,
    borderRadius: 4,
    elevation: 2,
    gap: 12,
    padding: 16,
    shadowColor: 'rgba(44, 44, 44, 0.06)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 10,
  },
  deliveryHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  editText: {
    color: colors.edit,
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
  },
  deliveryBody: {
    flexDirection: 'row',
    gap: 12,
  },
  deliveryPin: {
    marginTop: 2,
  },
  deliveryText: {
    flex: 1,
    gap: 2,
  },
  deliveryName: {
    color: colors.heading,
    fontFamily: 'Inter_500Medium',
    fontSize: 16,
  },
  deliveryAddress: {
    color: colors.muted,
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
  },
  deliveryEta: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
    marginTop: 4,
  },
  deliveryEtaText: {
    color: colors.green,
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
  },
  paymentList: {
    gap: 12,
    marginTop: -8,
  },
  paymentRow: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: colors.lightBorder,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  paymentRowSelected: {
    borderColor: colors.gold,
    borderWidth: 2,
  },
  paymentLeft: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  paymentLabel: {
    color: colors.heading,
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
  },
  radio: {
    alignItems: 'center',
    borderColor: colors.border,
    borderRadius: 10,
    borderWidth: 2,
    height: 20,
    justifyContent: 'center',
    width: 20,
  },
  radioSelected: {
    borderColor: colors.gold,
  },
  radioDot: {
    backgroundColor: colors.gold,
    borderRadius: 5,
    height: 10,
    width: 10,
  },
  priceCard: {
    backgroundColor: colors.priceCard,
    borderColor: colors.lightBorder,
    borderRadius: 4,
    borderWidth: 1,
    gap: 12,
    padding: 16,
  },
  priceRows: {
    gap: 10,
  },
  priceRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  priceLabel: {
    color: colors.muted,
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
  },
  priceValue: {
    color: colors.muted,
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
  },
  priceFree: {
    color: colors.green,
    fontFamily: 'Inter_500Medium',
    fontSize: 16,
  },
  priceDivider: {
    backgroundColor: colors.border,
    height: 1,
    marginVertical: 2,
  },
  totalLabel: {
    color: colors.heading,
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 18,
  },
  totalValue: {
    color: colors.heading,
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 18,
  },
  ctaShell: {
    backgroundColor: 'rgba(255, 248, 244, 0.9)',
    borderTopColor: colors.border,
    borderTopWidth: 1,
    bottom: 0,
    left: 0,
    paddingBottom: 28,
    paddingHorizontal: 16,
    paddingTop: 16,
    position: 'absolute',
    right: 0,
  },
  ctaButton: {
    alignItems: 'center',
    borderRadius: 4,
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'center',
    paddingVertical: 16,
  },
  ctaButtonDisabled: {
    opacity: 0.5,
  },
  ctaText: {
    color: colors.white,
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 20,
    letterSpacing: -0.2,
  },
});
