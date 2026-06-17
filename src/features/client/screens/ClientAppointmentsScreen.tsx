import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { ClientStackParamList, ClientTabParamList } from '@/navigation/navigation.types';
import { useMyBookings, useCancelBooking, type Booking } from '@/services/api/hooks/useBookingAPI';
import { useCreateReview } from '@/services/api/hooks/useCustomerAPI';
import { ReviewModal } from '@/features/client/components/ReviewModal';
import { resolveImageUrl } from '@/services/api/imageUrl';

const fallbackThumb = require('@/assets/home/top-lumina.png');

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
  pillBorder: 'rgba(217, 195, 173, 0.3)',
  segmentBg: '#F0E0D1',
  green: '#2E7D32',
  greenBg: '#F0FDF4',
  greenBorder: '#BBF7D0',
  red: '#C0392B',
  redBg: '#FEF2F2',
  redBorder: '#FECACA',
  apptIcon: '#7B5548',
  apptIconBg: '#FDEDDF',
};

type Tab = 'upcoming' | 'past';
type BookingsNavigation = BottomTabNavigationProp<ClientTabParamList>;

const toYMD = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

function formatDate(ymd?: string) {
  if (!ymd) return '';
  const d = new Date(`${ymd}T00:00:00`);
  if (Number.isNaN(d.getTime())) return ymd;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function servicesLabel(b: Booking) {
  const list = b.services ?? [];
  const first = list[0]?.name ?? list[0]?.service_name;
  if (!first) return `${list.length || 0} service${list.length === 1 ? '' : 's'}`;
  return list.length > 1 ? `${first} +${list.length - 1} more` : first;
}

function statusStyle(status: string) {
  const s = status?.toLowerCase();
  if (s === 'cancelled') return { pill: styles.statusCancelled, text: styles.statusTextCancelled };
  if (s === 'completed') return { pill: styles.statusDone, text: styles.statusTextDone };
  return { pill: styles.statusConfirmed, text: styles.statusTextConfirmed };
}

export function ClientAppointmentsScreen() {
  const navigation = useNavigation<BookingsNavigation>();
  const parent = navigation.getParent<NativeStackNavigationProp<ClientStackParamList>>();
  const [tab, setTab] = useState<Tab>('upcoming');

  const { data, isLoading, isError, refetch } = useMyBookings();
  const { mutate: cancelBooking, isPending: isCancelling } = useCancelBooking();
  const { mutate: createReview, isPending: isSubmittingReview } = useCreateReview();

  const [reviewBooking, setReviewBooking] = useState<Booking | null>(null);

  const todayYMD = toYMD(new Date());
  const { upcoming, past } = useMemo(() => {
    const bookings = data?.data ?? [];
    const isDone = (b: Booking) =>
      b.status?.toLowerCase() === 'completed' ||
      b.status?.toLowerCase() === 'cancelled' ||
      (b.booking_date ?? '') < todayYMD;
    return {
      upcoming: bookings.filter((b) => !isDone(b)),
      past: bookings.filter(isDone),
    };
  }, [data, todayYMD]);

  const list = tab === 'upcoming' ? upcoming : past;

  const openSalon = (b: Booking) =>
    parent?.navigate('SalonDetails', {
      salon: { id: b.salon_id, name: b.salon_name ?? 'Salon', location: '', rating: 'New' },
    });

  const submitReview = ({ rating, comment }: { rating: number; comment: string }) => {
    if (!reviewBooking) return;
    createReview(
      { salon_id: reviewBooking.salon_id, booking_id: reviewBooking.id, rating, comment },
      {
        onSuccess: () => {
          setReviewBooking(null);
          Alert.alert('Thank you!', 'Your review has been submitted.');
        },
        onError: (err: any) =>
          Alert.alert('Could not submit', err.message || 'Please try again later.'),
      },
    );
  };

  const confirmCancel = (b: Booking) => {
    Alert.alert('Cancel booking', `Cancel your booking ${b.booking_number}? This can't be undone.`, [
      { text: 'Keep', style: 'cancel' },
      {
        text: 'Cancel booking',
        style: 'destructive',
        onPress: () =>
          cancelBooking(b.id, {
            onError: (err: any) => Alert.alert('Error', err.message || 'Could not cancel booking.'),
          }),
      },
    ]);
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Bookings</Text>
      </View>

      <View style={styles.segment}>
        {(['upcoming', 'past'] as Tab[]).map((t) => (
          <Pressable
            key={t}
            onPress={() => setTab(t)}
            style={[styles.segmentButton, tab === t && styles.segmentActive]}
          >
            <Text style={[styles.segmentText, tab === t && styles.segmentTextActive]}>
              {t === 'upcoming' ? 'Upcoming' : 'Past'}
            </Text>
          </Pressable>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <View style={styles.empty}>
            <ActivityIndicator color={colors.gold} size="large" />
          </View>
        ) : isError ? (
          <View style={styles.empty}>
            <Text style={styles.emptySubtitle}>Couldn't load your bookings.</Text>
            <Pressable onPress={() => refetch()} style={styles.retryBtn}>
              <Text style={styles.retryText}>Retry</Text>
            </Pressable>
          </View>
        ) : list.length === 0 ? (
          <View style={styles.empty}>
            <View style={styles.emptyIcon}>
              <Ionicons color={colors.apptIcon} name="calendar-outline" size={26} />
            </View>
            <Text style={styles.emptyTitle}>No bookings here yet</Text>
            <Text style={styles.emptySubtitle}>Your {tab} salon visits will appear here.</Text>
          </View>
        ) : (
          <View style={styles.list}>
            {list.map((booking) => {
              const ss = statusStyle(booking.status);
              const logo = resolveImageUrl(booking.salon_logo_url);
              const canCancel = tab === 'upcoming';
              const isCompleted = booking.status?.toLowerCase() === 'completed';
              return (
                <View key={booking.id} style={styles.card}>
                  <View style={styles.cardTop}>
                    <Image source={logo ? { uri: logo } : fallbackThumb} style={styles.thumb} />
                    <View style={styles.cardInfo}>
                      <Text numberOfLines={1} style={styles.service}>
                        {servicesLabel(booking)}
                      </Text>
                      <Text style={styles.salon}>{booking.salon_name ?? 'Salon'}</Text>
                      <View style={styles.metaRow}>
                        <Ionicons color={colors.gold} name="time-outline" size={13} />
                        <Text style={styles.metaText}>
                          {formatDate(booking.booking_date)}
                          {booking.time_slots?.[0] ? `, ${booking.time_slots[0]}` : ''}
                        </Text>
                      </View>
                    </View>
                    <View style={[styles.statusPill, ss.pill]}>
                      <Text style={[styles.statusText, ss.text]}>{booking.status}</Text>
                    </View>
                  </View>

                  {(() => {
                    const savings =
                      Number(booking.discount_amount ?? 0) +
                      Number(booking.convenience_fee_discount ?? 0);
                    const hasCoupon = Boolean(booking.coupon_code) && savings > 0;
                    const payAtSalon = Number(booking.service_price ?? 0);
                    return (
                      <View style={styles.payRow}>
                        <View>
                          <Text style={styles.payLabel}>Pay at salon</Text>
                          <Text style={styles.payAmount}>₹{payAtSalon.toFixed(0)}</Text>
                        </View>
                        {hasCoupon ? (
                          <View style={styles.couponChip}>
                            <Ionicons color={colors.green} name="pricetag" size={12} />
                            <Text style={styles.couponText}>
                              {booking.coupon_code} · saved ₹{savings.toFixed(0)}
                            </Text>
                          </View>
                        ) : null}
                      </View>
                    );
                  })()}

                  <View style={styles.divider} />

                  <View style={styles.actions}>
                    {canCancel ? (
                      <Pressable
                        disabled={isCancelling}
                        onPress={() => confirmCancel(booking)}
                        style={[styles.actionBtn, styles.actionOutline]}
                      >
                        <Text style={styles.actionOutlineText}>Cancel</Text>
                      </Pressable>
                    ) : isCompleted ? (
                      <Pressable
                        onPress={() => setReviewBooking(booking)}
                        style={[styles.actionBtn, styles.actionOutline]}
                      >
                        <Ionicons color={colors.text} name="star-outline" size={15} />
                        <Text style={styles.actionOutlineText}>Write Review</Text>
                      </Pressable>
                    ) : null}
                    <Pressable
                      onPress={() => openSalon(booking)}
                      style={[styles.actionBtn, styles.actionPrimary]}
                    >
                      <Text style={styles.actionPrimaryText}>
                        {canCancel ? 'View Salon' : 'Book Again'}
                      </Text>
                    </Pressable>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      <ReviewModal
        visible={reviewBooking != null}
        salonName={reviewBooking?.salon_name ?? 'Salon'}
        submitting={isSubmittingReview}
        onSubmit={submitReview}
        onDismiss={() => setReviewBooking(null)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: colors.bg, flex: 1 },
  header: {
    backgroundColor: colors.white,
    elevation: 3,
    paddingHorizontal: 16,
    paddingVertical: 18,
    shadowColor: 'rgba(248, 158, 7, 0.08)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 20,
  },
  headerTitle: { color: colors.heading, fontFamily: 'Montserrat_600SemiBold', fontSize: 22, letterSpacing: -0.2 },
  segment: { backgroundColor: colors.segmentBg, borderRadius: 14, flexDirection: 'row', margin: 16, padding: 4 },
  segmentButton: { alignItems: 'center', borderRadius: 10, flex: 1, justifyContent: 'center', paddingVertical: 10 },
  segmentActive: { backgroundColor: colors.gold },
  segmentText: { color: colors.text, fontFamily: 'Inter_600SemiBold', fontSize: 14 },
  segmentTextActive: { color: colors.white },
  scrollContent: { paddingBottom: 120, paddingHorizontal: 16, paddingTop: 4 },
  list: { gap: 16 },
  card: {
    backgroundColor: colors.cardCream2,
    borderColor: colors.pillBorder,
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
  },
  cardTop: { flexDirection: 'row', gap: 12 },
  thumb: { backgroundColor: colors.tan, borderRadius: 12, height: 64, width: 64 },
  cardInfo: { flex: 1, gap: 3 },
  service: { color: colors.heading, fontFamily: 'Poppins_700Bold', fontSize: 16 },
  salon: { color: colors.text, fontFamily: 'Inter_400Regular', fontSize: 13 },
  metaRow: { alignItems: 'center', flexDirection: 'row', gap: 4, marginTop: 2 },
  metaText: { color: colors.text, fontFamily: 'Inter_500Medium', fontSize: 13 },
  statusPill: { alignSelf: 'flex-start', borderRadius: 9999, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 4 },
  statusConfirmed: { backgroundColor: colors.greenBg, borderColor: colors.greenBorder },
  statusDone: { backgroundColor: colors.tan, borderColor: colors.border },
  statusCancelled: { backgroundColor: colors.redBg, borderColor: colors.redBorder },
  statusText: { fontFamily: 'Inter_600SemiBold', fontSize: 11, textTransform: 'capitalize' },
  statusTextConfirmed: { color: colors.green },
  statusTextDone: { color: colors.muted },
  statusTextCancelled: { color: colors.red },
  divider: { backgroundColor: colors.border, height: 1, marginVertical: 14 },
  payRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  payLabel: { color: colors.muted, fontFamily: 'Inter_500Medium', fontSize: 11 },
  payAmount: { color: colors.heading, fontFamily: 'Montserrat_600SemiBold', fontSize: 16 },
  couponChip: {
    alignItems: 'center',
    backgroundColor: colors.greenBg,
    borderColor: colors.greenBorder,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  couponText: { color: colors.green, fontFamily: 'Inter_600SemiBold', fontSize: 11 },
  actions: { flexDirection: 'row', gap: 12 },
  actionBtn: { alignItems: 'center', borderRadius: 12, flex: 1, flexDirection: 'row', gap: 6, justifyContent: 'center', paddingVertical: 11 },
  actionOutline: { backgroundColor: colors.white, borderColor: colors.border, borderWidth: 1 },
  actionOutlineText: { color: colors.text, fontFamily: 'Inter_600SemiBold', fontSize: 14 },
  actionPrimary: { backgroundColor: colors.gold },
  actionPrimaryText: { color: colors.white, fontFamily: 'Inter_600SemiBold', fontSize: 14 },
  empty: { alignItems: 'center', gap: 14, paddingTop: 64 },
  emptyIcon: {
    alignItems: 'center',
    backgroundColor: colors.apptIconBg,
    borderRadius: 20,
    height: 64,
    justifyContent: 'center',
    marginBottom: 2,
    width: 64,
  },
  emptyTitle: { color: colors.heading, fontFamily: 'Poppins_700Bold', fontSize: 18 },
  emptySubtitle: { color: colors.text, fontFamily: 'Inter_400Regular', fontSize: 14, textAlign: 'center' },
  retryBtn: { backgroundColor: colors.gold, borderRadius: 24, paddingHorizontal: 24, paddingVertical: 10 },
  retryText: { color: colors.white, fontFamily: 'Inter_600SemiBold', fontSize: 14 },
});
