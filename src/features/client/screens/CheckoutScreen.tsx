import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { ClientStackParamList } from '@/navigation/navigation.types';

const glowStudio = require('@/assets/checkout/glow-studio.png');

const colors = {
  bg: '#FFFAF5',
  header: 'rgba(245, 233, 218, 0.95)',
  backBtn: '#FFF1E6',
  heading: '#221A11',
  card: '#FFF6EC',
  gold: '#F89E07',
  text: '#534433',
  thumbBg: '#EDE1D2',
  datePill: '#FCEBDC',
  divider: 'rgba(217, 195, 173, 0.3)',
  couponBorder: 'rgba(248, 158, 7, 0.2)',
  couponTitle: '#2C2C2C',
  white: '#FFFFFF',
  inputBorder: 'rgba(217, 195, 173, 0.7)',
  placeholder: '#9CA3AF',
  selectedCardBg: 'rgba(248, 158, 7, 0.05)',
  badgeBg: '#F6E5D7',
  radioEmpty: '#D9C3AD',
  ctaBorder: 'rgba(217, 195, 173, 0.45)',
  payDivider: 'rgba(255, 255, 255, 0.6)',
};

type PaymentMethod = 'card' | 'upi' | 'paytm';

const methods: { id: PaymentMethod; label: string; sub?: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { id: 'card', label: '•••• 4242', sub: 'Expires 12/25', icon: 'card-outline' },
  { id: 'upi', label: 'UPI', icon: 'phone-portrait-outline' },
  { id: 'paytm', label: 'Paytm', icon: 'wallet-outline' },
];

type Navigation = NativeStackNavigationProp<ClientStackParamList>;
type Route = RouteProp<ClientStackParamList, 'Checkout'>;

export function CheckoutScreen() {
  const navigation = useNavigation<Navigation>();
  const route = useRoute<Route>();
  const service = route.params?.serviceName ?? 'Haircut & Styling';
  const [method, setMethod] = useState<PaymentMethod>('card');

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
      <View style={styles.headerWrap}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons color={colors.heading} name="arrow-back" size={16} />
        </Pressable>
        <Text style={styles.headerTitle}>Checkout</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.summaryCard}>
          <View style={styles.thumb}>
            <Image source={glowStudio} style={styles.thumbImage} />
          </View>
          <Text style={styles.salonName}>Glow Studio</Text>
          <Text style={styles.salonService}>{service}</Text>
          <View style={styles.datePill}>
            <Ionicons color={colors.gold} name="calendar-outline" size={13} />
            <Text style={styles.datePillText}>Date: Oct 24, 2024 | Time: 4:30 PM</Text>
          </View>
        </View>

        <View style={styles.block}>
          <Text style={styles.sectionTitle}>PRICE BREAKDOWN</Text>
          <View style={styles.priceCard}>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Subtotal</Text>
              <Text style={styles.priceValue}>$65.00</Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Tax</Text>
              <Text style={styles.priceValue}>$5.20</Text>
            </View>
            <View style={styles.priceDivider} />
            <View style={styles.priceRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>$70.20</Text>
            </View>
          </View>
        </View>

        <View style={styles.block}>
          <Text style={[styles.sectionTitle, styles.couponHeading]}>AVAILABLE COUPONS</Text>
          <LinearGradient
            colors={[colors.card, colors.datePill]}
            end={{ x: 0.2, y: 1 }}
            start={{ x: 0, y: 0 }}
            style={styles.couponCard}
          >
            <View style={styles.couponTopRow}>
              <Ionicons color={colors.gold} name="pricetag" size={16} />
              <Text style={styles.couponTitle}>Flat 10% OFF</Text>
            </View>
            <Text style={styles.couponSubtitle}>On all services with online payment.</Text>
          </LinearGradient>
        </View>

        <View style={styles.couponInput}>
          <TextInput
            placeholder="Enter coupon code"
            placeholderTextColor={colors.placeholder}
            style={styles.couponInputText}
          />
          <Pressable style={styles.applyButton}>
            <Text style={styles.applyText}>APPLY</Text>
          </Pressable>
        </View>

        <View style={styles.block}>
          <Text style={styles.sectionTitle}>PAYMENT METHOD</Text>
          <View style={styles.methodList}>
            {methods.map((item) => {
              const isSelected = item.id === method;

              return (
                <Pressable
                  key={item.id}
                  onPress={() => setMethod(item.id)}
                  style={[styles.methodRow, isSelected && styles.methodRowSelected]}
                >
                  <View style={styles.methodLeft}>
                    <View style={styles.methodBadge}>
                      <Ionicons color={colors.heading} name={item.icon} size={16} />
                    </View>
                    <View>
                      <Text style={styles.methodLabel}>{item.label}</Text>
                      {item.sub ? <Text style={styles.methodSub}>{item.sub}</Text> : null}
                    </View>
                  </View>
                  <View style={[styles.radio, isSelected && styles.radioSelected]}>
                    {isSelected ? <View style={styles.radioDot} /> : null}
                  </View>
                </Pressable>
              );
            })}
          </View>

          <Pressable style={styles.addPayment}>
            <Ionicons color={colors.text} name="add" size={18} />
            <Text style={styles.addPaymentText}>Add new payment method</Text>
          </Pressable>
        </View>
      </ScrollView>

      <View style={styles.ctaShell}>
        <Pressable
          onPress={() => navigation.navigate('BookingConfirmed', { serviceName: service })}
          style={styles.payButton}
        >
          <Text style={styles.payText}>PAY NOW</Text>
          <View style={styles.payRight}>
            <Text style={styles.payDivider}>|</Text>
            <Text style={styles.payAmount}>$70.20</Text>
          </View>
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
  headerWrap: {
    alignItems: 'center',
    backgroundColor: colors.header,
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    alignItems: 'center',
    backgroundColor: colors.backBtn,
    borderRadius: 12,
    height: 40,
    justifyContent: 'center',
    left: 20,
    position: 'absolute',
    width: 40,
  },
  headerTitle: {
    color: colors.heading,
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 22,
    letterSpacing: -0.44,
  },
  scrollContent: {
    gap: 23,
    paddingBottom: 140,
    paddingHorizontal: 17,
    paddingTop: 16,
  },
  summaryCard: {
    alignItems: 'center',
    backgroundColor: colors.card,
    borderColor: colors.gold,
    borderRadius: 8,
    borderWidth: 1,
    elevation: 3,
    gap: 8,
    padding: 16,
    shadowColor: 'rgba(44, 44, 44, 0.08)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 24,
  },
  thumb: {
    backgroundColor: colors.thumbBg,
    borderRadius: 12,
    height: 64,
    overflow: 'hidden',
    width: 64,
  },
  thumbImage: {
    height: '100%',
    width: '100%',
  },
  salonName: {
    color: colors.heading,
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 20,
    letterSpacing: -0.2,
  },
  salonService: {
    color: colors.text,
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
  },
  datePill: {
    alignItems: 'center',
    backgroundColor: colors.datePill,
    borderRadius: 12,
    flexDirection: 'row',
    gap: 4,
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  datePillText: {
    color: colors.heading,
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
  },
  block: {
    gap: 16,
  },
  sectionTitle: {
    color: colors.heading,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    letterSpacing: 1.4,
    paddingHorizontal: 4,
  },
  priceCard: {
    backgroundColor: colors.card,
    borderRadius: 8,
    elevation: 3,
    gap: 12,
    padding: 16,
    shadowColor: 'rgba(44, 44, 44, 0.08)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 24,
  },
  priceRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  priceLabel: {
    color: colors.text,
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
  },
  priceValue: {
    color: colors.heading,
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
  },
  priceDivider: {
    backgroundColor: colors.divider,
    height: 1,
  },
  totalLabel: {
    color: colors.heading,
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 20,
    letterSpacing: -0.2,
  },
  totalValue: {
    color: colors.gold,
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 20,
    letterSpacing: -0.2,
  },
  couponHeading: {
    color: colors.text,
  },
  couponCard: {
    borderColor: colors.couponBorder,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
    padding: 16,
    width: 240,
  },
  couponTopRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  couponTitle: {
    color: colors.couponTitle,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
  },
  couponSubtitle: {
    color: colors.text,
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    lineHeight: 15.6,
  },
  couponInput: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: colors.inputBorder,
    borderRadius: 14,
    borderWidth: 1,
    elevation: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 6,
    paddingLeft: 12,
    shadowColor: 'rgba(0, 0, 0, 0.05)',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 2,
  },
  couponInputText: {
    color: colors.heading,
    flex: 1,
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
  },
  applyButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  applyText: {
    color: colors.gold,
    fontFamily: 'Montserrat_700Bold',
    fontSize: 14,
  },
  methodList: {
    gap: 12,
  },
  methodRow: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: colors.divider,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  methodRowSelected: {
    backgroundColor: colors.selectedCardBg,
    borderColor: colors.gold,
    borderWidth: 2,
  },
  methodLeft: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  methodBadge: {
    alignItems: 'center',
    backgroundColor: colors.badgeBg,
    borderRadius: 2,
    height: 24,
    justifyContent: 'center',
    width: 40,
  },
  methodLabel: {
    color: colors.heading,
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
  },
  methodSub: {
    color: colors.text,
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    marginTop: 2,
  },
  radio: {
    alignItems: 'center',
    borderColor: colors.radioEmpty,
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
  addPayment: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  addPaymentText: {
    color: colors.text,
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
  },
  ctaShell: {
    backgroundColor: colors.bg,
    borderTopColor: colors.ctaBorder,
    borderTopWidth: 1,
    bottom: 0,
    left: 0,
    paddingBottom: 32,
    paddingHorizontal: 20,
    paddingTop: 16,
    position: 'absolute',
    right: 0,
  },
  payButton: {
    alignItems: 'center',
    backgroundColor: colors.gold,
    borderRadius: 12,
    elevation: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    shadowColor: 'rgba(248, 158, 7, 0.25)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 24,
  },
  payText: {
    color: colors.white,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    letterSpacing: 0.35,
  },
  payRight: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  payDivider: {
    color: colors.payDivider,
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 14,
  },
  payAmount: {
    color: colors.white,
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 20,
    letterSpacing: -0.2,
  },
});
