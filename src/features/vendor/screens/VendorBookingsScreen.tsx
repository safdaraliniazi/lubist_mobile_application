import { useMemo, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { PaymentLockedNotice } from '@/features/vendor/components/PaymentLockedNotice';
import { StatusBadge, getBookingDisplayStatus } from '@/features/vendor/components/StatusBadge';
import { useVendorPaymentGate } from '@/features/vendor/hooks/useVendorPaymentGate';
import { useVendorBookings, VendorBooking } from '@/services/api/hooks/useVendorAPI';
import { Screen } from '@/shared/components/Screen';
import { SurfaceCard } from '@/shared/components/SurfaceCard';
import { VendorStackParamList } from '@/navigation/navigation.types';
import { palette } from '@/theme/palette';
import { typography } from '@/theme/typography';

type Navigation = NativeStackNavigationProp<VendorStackParamList>;

type StatusFilter = 'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled';
type DateFilter = 'all' | 'today' | 'upcoming' | 'past';

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function serviceLine(booking: VendorBooking): string {
  const names = booking.service_names?.length
    ? booking.service_names
    : (booking.services ?? []).map((s) => s.name).filter(Boolean);
  return names.length > 1 ? `${names[0]} +${names.length - 1} more` : names[0] || 'Service';
}

export function VendorBookingsScreen() {
  const navigation = useNavigation<Navigation>();
  const { salon, isPaymentPending } = useVendorPaymentGate();
  const { data: bookings, isLoading } = useVendorBookings();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');

  const stats = useMemo(() => {
    const list = bookings ?? [];
    const count = (s: string) => list.filter((b) => b.status === s).length;
    const revenue = list
      .filter((b) => b.status === 'completed')
      .reduce((sum, b) => sum + (b.total_amount ?? 0), 0);
    return {
      total: list.length,
      pending: count('pending'),
      confirmed: count('confirmed'),
      completed: count('completed'),
      cancelled: count('cancelled'),
      revenue,
    };
  }, [bookings]);

  const filtered = useMemo(() => {
    const today = todayIso();
    return (bookings ?? []).filter((b) => {
      if (statusFilter !== 'all' && b.status !== statusFilter) return false;
      if (dateFilter === 'today' && b.booking_date !== today) return false;
      if (dateFilter === 'upcoming' && b.booking_date < today) return false;
      if (dateFilter === 'past' && b.booking_date >= today) return false;
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        const haystack = [b.customer_name, b.booking_number, b.customer_phone, b.customer_email]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [bookings, statusFilter, dateFilter, search]);

  if (isPaymentPending) {
    return <PaymentLockedNotice feeAmount={salon?.registration_fee_amount} />;
  }

  return (
    <Screen scrollable>
      <Text style={styles.title}>Bookings</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statsRow}>
        {[
          { label: 'Total', value: stats.total },
          { label: 'Pending', value: stats.pending },
          { label: 'Confirmed', value: stats.confirmed },
          { label: 'Completed', value: stats.completed },
          { label: 'Cancelled', value: stats.cancelled },
          { label: 'Revenue', value: `₹${stats.revenue.toLocaleString()}` },
        ].map((stat) => (
          <View key={stat.label} style={styles.statCard}>
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </ScrollView>

      <TextInput
        style={styles.search}
        placeholder="Search by customer, phone, booking #"
        placeholderTextColor={palette.muted}
        value={search}
        onChangeText={setSearch}
      />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
        {(['all', 'pending', 'confirmed', 'completed', 'cancelled'] as StatusFilter[]).map((filter) => (
          <Pressable
            key={filter}
            style={[styles.chip, statusFilter === filter && styles.chipActive]}
            onPress={() => setStatusFilter(filter)}
          >
            <Text style={[styles.chipLabel, statusFilter === filter && styles.chipLabelActive]}>
              {filter === 'all' ? 'All' : filter[0].toUpperCase() + filter.slice(1)}
            </Text>
          </Pressable>
        ))}
        {(['today', 'upcoming', 'past'] as DateFilter[]).map((filter) => (
          <Pressable
            key={filter}
            style={[styles.chip, dateFilter === filter && styles.chipActive]}
            onPress={() => setDateFilter(dateFilter === filter ? 'all' : filter)}
          >
            <Text style={[styles.chipLabel, dateFilter === filter && styles.chipLabelActive]}>
              {filter[0].toUpperCase() + filter.slice(1)}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {isLoading && !bookings ? (
        <ActivityIndicator color={palette.primary} style={styles.loader} />
      ) : filtered.length === 0 ? (
        <SurfaceCard>
          <Text style={styles.emptyText}>No bookings match these filters</Text>
        </SurfaceCard>
      ) : (
        <View style={styles.list}>
          {filtered.map((booking) => (
            <Pressable
              key={booking.id}
              onPress={() => navigation.navigate('BookingDetails', { bookingId: booking.id })}
            >
              <SurfaceCard>
                <View style={styles.bookingRow}>
                  <View style={styles.bookingInfo}>
                    <Text style={styles.bookingName}>{booking.customer_name || 'Guest'}</Text>
                    <Text style={styles.bookingMeta}>{serviceLine(booking)}</Text>
                    <Text style={styles.bookingMeta}>
                      {booking.booking_date} • {booking.time_slots?.[0] ?? ''}
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
  title: {
    color: palette.text,
    fontSize: 26,
    fontWeight: typography.weight.bold,
    marginBottom: 16,
  },
  statsRow: {
    marginBottom: 14,
  },
  statCard: {
    alignItems: 'center',
    backgroundColor: palette.surface,
    borderColor: palette.border,
    borderRadius: 16,
    borderWidth: 1,
    marginRight: 10,
    minWidth: 84,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  statValue: {
    color: palette.text,
    fontSize: 18,
    fontWeight: typography.weight.bold,
  },
  statLabel: {
    color: palette.muted,
    fontSize: 12,
    marginTop: 2,
  },
  search: {
    backgroundColor: palette.surface,
    borderColor: palette.border,
    borderRadius: 14,
    borderWidth: 1,
    color: palette.text,
    fontSize: 14,
    marginBottom: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  filterRow: {
    marginBottom: 16,
  },
  chip: {
    backgroundColor: palette.surface,
    borderColor: palette.border,
    borderRadius: 999,
    borderWidth: 1,
    marginRight: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  chipActive: {
    backgroundColor: palette.primary,
    borderColor: palette.primary,
  },
  chipLabel: {
    color: palette.text,
    fontSize: 13,
    fontWeight: typography.weight.medium,
  },
  chipLabelActive: {
    color: palette.surface,
  },
  loader: {
    marginVertical: 24,
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
