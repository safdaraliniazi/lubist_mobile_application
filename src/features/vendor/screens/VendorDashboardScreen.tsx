import { useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { MetricCard } from '@/shared/components/MetricCard';
import { Screen } from '@/shared/components/Screen';
import { SurfaceCard } from '@/shared/components/SurfaceCard';
import { StatusBadge, getBookingDisplayStatus } from '@/features/vendor/components/StatusBadge';
import { PaymentLockedNotice } from '@/features/vendor/components/PaymentLockedNotice';
import { useVendorPaymentGate } from '@/features/vendor/hooks/useVendorPaymentGate';
import { useVendorAnalytics, useVendorBookings, VendorBooking } from '@/services/api/hooks/useVendorAPI';
import { VendorStackParamList, VendorTabParamList } from '@/navigation/navigation.types';
import { palette } from '@/theme/palette';
import { typography } from '@/theme/typography';

type Navigation = BottomTabNavigationProp<VendorTabParamList>;

function firstServiceLine(booking: VendorBooking): string {
  const names = booking.service_names?.length
    ? booking.service_names
    : (booking.services ?? []).map((s) => s.name).filter((n): n is string => Boolean(n));
  if (!names.length) return 'Service';
  return names.length > 1 ? `${names[0]} +${names.length - 1} more` : names[0];
}

function bookingTime(booking: VendorBooking): string {
  return booking.time_slots?.[0] ?? booking.booking_date;
}

export function VendorDashboardScreen() {
  const navigation = useNavigation<Navigation>();
  const stackNavigation = navigation.getParent<NativeStackNavigationProp<VendorStackParamList>>();

  const { salon, isPaymentPending } = useVendorPaymentGate();
  const { data: analytics, isLoading: analyticsLoading } = useVendorAnalytics();
  const { data: bookings, isLoading: bookingsLoading } = useVendorBookings({ limit: 10 });

  const recentBookings = [...(bookings ?? [])]
    .sort((a, b) => (b.created_at || b.booking_date).localeCompare(a.created_at || a.booking_date))
    .slice(0, 5);

  if (isPaymentPending) {
    return <PaymentLockedNotice feeAmount={salon?.registration_fee_amount} />;
  }

  return (
    <Screen scrollable>
      <View style={styles.hero}>
        <Text style={styles.title}>Vendor Dashboard</Text>
        <Text style={styles.subtitle}>Track salon performance, active services, and booking demand.</Text>
      </View>

      {analyticsLoading && !analytics ? (
        <ActivityIndicator color={palette.primary} style={styles.loader} />
      ) : (
        <View style={styles.grid}>
          <MetricCard label="Revenue" value={`₹${(analytics?.total_revenue ?? 0).toLocaleString()}`} />
          <MetricCard label="Bookings" value={String(analytics?.total_bookings ?? 0)} />
          <MetricCard label="Active Services" value={String(analytics?.active_services ?? 0)} />
          <MetricCard label="Avg Rating" value={(analytics?.average_rating ?? 0).toFixed(1)} />
        </View>
      )}

      <View style={styles.actionsRow}>
        <Pressable style={styles.actionButton} onPress={() => navigation.navigate('Bookings')}>
          <Text style={styles.actionLabel}>Bookings</Text>
        </Pressable>
        <Pressable style={styles.actionButton} onPress={() => navigation.navigate('Services')}>
          <Text style={styles.actionLabel}>Manage Services</Text>
        </Pressable>
        <Pressable style={styles.actionButton} onPress={() => stackNavigation?.navigate('RunPromo')}>
          <Text style={styles.actionLabel}>Run Promo</Text>
        </Pressable>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recent Bookings</Text>
        <Pressable onPress={() => navigation.navigate('Bookings')}>
          <Text style={styles.viewAll}>View All</Text>
        </Pressable>
      </View>

      {bookingsLoading && !bookings ? (
        <ActivityIndicator color={palette.primary} style={styles.loader} />
      ) : recentBookings.length === 0 ? (
        <SurfaceCard>
          <Text style={styles.emptyText}>No bookings yet</Text>
        </SurfaceCard>
      ) : (
        <View style={styles.list}>
          {recentBookings.map((booking) => (
            <Pressable
              key={booking.id}
              onPress={() => stackNavigation?.navigate('BookingDetails', { bookingId: booking.id })}
            >
              <SurfaceCard>
                <View style={styles.bookingRow}>
                  <View style={styles.bookingInfo}>
                    <Text style={styles.bookingName}>{booking.customer_name || 'Guest'}</Text>
                    <Text style={styles.bookingMeta}>
                      {firstServiceLine(booking)} • {bookingTime(booking)}
                    </Text>
                  </View>
                  <StatusBadge status={getBookingDisplayStatus(booking.status, booking.booking_date)} />
                </View>
              </SurfaceCard>
            </Pressable>
          ))}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    gap: 8,
    marginBottom: 20,
  },
  title: {
    color: palette.text,
    fontSize: 28,
    fontWeight: typography.weight.bold,
  },
  subtitle: {
    color: palette.muted,
    fontSize: 15,
    lineHeight: 22,
  },
  loader: {
    marginVertical: 24,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  actionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 20,
  },
  actionButton: {
    backgroundColor: palette.surface,
    borderColor: palette.border,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  actionLabel: {
    color: palette.primary,
    fontSize: 14,
    fontWeight: typography.weight.semibold,
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 28,
    marginBottom: 12,
  },
  sectionTitle: {
    color: palette.text,
    fontSize: 18,
    fontWeight: typography.weight.bold,
  },
  viewAll: {
    color: palette.primary,
    fontSize: 14,
    fontWeight: typography.weight.semibold,
  },
  emptyText: {
    color: palette.muted,
    fontSize: 14,
    textAlign: 'center',
  },
  list: {
    gap: 12,
  },
  bookingRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  bookingInfo: {
    flex: 1,
    gap: 4,
    marginRight: 12,
  },
  bookingName: {
    color: palette.text,
    fontSize: 16,
    fontWeight: typography.weight.semibold,
  },
  bookingMeta: {
    color: palette.muted,
    fontSize: 13,
  },
});
