import { useMemo } from 'react';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ActivityIndicator, Alert, Linking, Pressable, StyleSheet, Text, View } from 'react-native';

import { StatusBadge, getBookingDisplayStatus } from '@/features/vendor/components/StatusBadge';
import { useUpdateVendorBookingStatus, useVendorBookings } from '@/services/api/hooks/useVendorAPI';
import { Screen } from '@/shared/components/Screen';
import { SurfaceCard } from '@/shared/components/SurfaceCard';
import { VendorStackParamList } from '@/navigation/navigation.types';
import { palette } from '@/theme/palette';
import { typography } from '@/theme/typography';

type Navigation = NativeStackNavigationProp<VendorStackParamList>;
type Route = RouteProp<VendorStackParamList, 'BookingDetails'>;

function formatDate(dateStr?: string): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function VendorBookingDetailsScreen() {
  const navigation = useNavigation<Navigation>();
  const route = useRoute<Route>();
  const { data: bookings, isLoading } = useVendorBookings();
  const updateStatus = useUpdateVendorBookingStatus();

  const booking = useMemo(
    () => bookings?.find((b) => b.id === route.params.bookingId),
    [bookings, route.params.bookingId],
  );

  if (isLoading && !bookings) {
    return (
      <Screen>
        <ActivityIndicator color={palette.primary} style={styles.loader} />
      </Screen>
    );
  }

  if (!booking) {
    return (
      <Screen>
        <Text style={styles.emptyText}>Booking not found.</Text>
        <Pressable onPress={() => navigation.goBack()}>
          <Text style={styles.backLink}>Back to bookings</Text>
        </Pressable>
      </Screen>
    );
  }

  const hasCoupon = !!booking.coupon_code && (booking.discount_amount ?? 0) + (booking.convenience_fee_discount ?? 0) > 0;
  const subtotal = booking.subtotal_service_price ?? booking.service_price + (booking.discount_amount ?? 0);
  const totalDue = booking.total_amount ?? booking.service_price + booking.convenience_fee;

  async function handleStatusUpdate(status: string) {
    try {
      await updateStatus.mutateAsync({ bookingId: booking!.id, status });
      Alert.alert('Success', `Booking ${status} successfully!`);
      navigation.goBack();
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to update booking status');
    }
  }

  return (
    <Screen scrollable>
      <View style={styles.header}>
        <Text style={styles.bookingNumber}>#{booking.booking_number}</Text>
        <StatusBadge status={getBookingDisplayStatus(booking.status, booking.booking_date)} />
      </View>

      <SurfaceCard>
        <Text style={styles.sectionTitle}>Customer Information</Text>
        <Text style={styles.line}>{booking.customer_name || 'Guest'}</Text>
        {booking.customer_email ? <Text style={styles.lineMuted}>{booking.customer_email}</Text> : null}
        {booking.customer_phone ? (
          <Pressable onPress={() => Linking.openURL(`tel:${booking.customer_phone}`)}>
            <Text style={styles.callLink}>Call Customer ({booking.customer_phone})</Text>
          </Pressable>
        ) : null}
      </SurfaceCard>

      <SurfaceCard>
        <Text style={styles.sectionTitle}>Appointment Details</Text>
        <Text style={styles.line}>Date: {formatDate(booking.booking_date)}</Text>
        <Text style={styles.line}>
          Time: {(booking.time_slots ?? []).join(', ') || '—'} ({booking.duration_minutes} min)
        </Text>
      </SurfaceCard>

      <SurfaceCard>
        <Text style={styles.sectionTitle}>Services Requested</Text>
        {(booking.services ?? []).length ? (
          (booking.services ?? []).map((service, idx) => (
            <View key={idx} style={styles.serviceRow}>
              <Text style={styles.line}>
                {service.name}
                {service.quantity && service.quantity > 1 ? ` × ${service.quantity}` : ''}
              </Text>
              {service.duration_minutes ? (
                <Text style={styles.lineMuted}>{service.duration_minutes} min</Text>
              ) : null}
            </View>
          ))
        ) : (
          <Text style={styles.lineMuted}>{booking.service_names_str || 'No services listed'}</Text>
        )}
      </SurfaceCard>

      <SurfaceCard>
        <Text style={styles.sectionTitle}>Payment Summary</Text>
        {hasCoupon ? (
          <>
            <View style={styles.row}>
              <Text style={styles.lineMuted}>Service Total</Text>
              <Text style={styles.strike}>₹{subtotal.toLocaleString()}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.lineMuted}>Coupon Discount ({booking.coupon_code})</Text>
              <Text style={styles.discount}>-₹{(booking.discount_amount ?? 0).toLocaleString()}</Text>
            </View>
          </>
        ) : null}
        <View style={styles.row}>
          <Text style={styles.lineMuted}>{hasCoupon ? 'Service Subtotal' : 'Subtotal'}</Text>
          <Text style={styles.line}>₹{booking.service_price.toLocaleString()}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.lineMuted}>{booking.convenience_fee ? 'Convenience Fee' : 'Tax / Fees'}</Text>
          <Text style={styles.line}>₹{booking.convenience_fee.toLocaleString()}</Text>
        </View>
        <View style={[styles.row, styles.totalRow]}>
          <Text style={styles.totalLabel}>Total Due</Text>
          <Text style={styles.totalLabel}>₹{totalDue.toLocaleString()}</Text>
        </View>
      </SurfaceCard>

      <SurfaceCard>
        <Text style={styles.sectionTitle}>Collection Details</Text>
        <View style={styles.row}>
          <Text style={styles.lineMuted}>To Collect at Salon</Text>
          <Text style={styles.line}>₹{booking.service_price.toLocaleString()}</Text>
        </View>
        <Text style={styles.hint}>Collect this amount from the customer after the service is completed.</Text>
      </SurfaceCard>

      {booking.notes ? (
        <SurfaceCard>
          <Text style={styles.sectionTitle}>Notes</Text>
          <Text style={styles.lineMuted}>{booking.notes}</Text>
        </SurfaceCard>
      ) : null}

      <View style={styles.footer}>
        {booking.status === 'pending' ? (
          <>
            <Pressable
              style={styles.primaryButton}
              disabled={updateStatus.isPending}
              onPress={() => handleStatusUpdate('confirmed')}
            >
              <Text style={styles.primaryButtonLabel}>Confirm Booking</Text>
            </Pressable>
            <Pressable
              style={styles.secondaryButton}
              disabled={updateStatus.isPending}
              onPress={() => handleStatusUpdate('cancelled')}
            >
              <Text style={styles.secondaryButtonLabel}>Cancel Booking</Text>
            </Pressable>
          </>
        ) : booking.status === 'confirmed' ? (
          <>
            <Pressable
              style={styles.primaryButton}
              disabled={updateStatus.isPending}
              onPress={() => handleStatusUpdate('completed')}
            >
              <Text style={styles.primaryButtonLabel}>Mark as Completed</Text>
            </Pressable>
            <Pressable
              style={styles.secondaryButton}
              disabled={updateStatus.isPending}
              onPress={() => handleStatusUpdate('cancelled')}
            >
              <Text style={styles.secondaryButtonLabel}>Cancel Booking</Text>
            </Pressable>
          </>
        ) : (
          <>
            <Text style={styles.hint}>This booking is marked as {booking.status}.</Text>
            <Pressable onPress={() => navigation.goBack()}>
              <Text style={styles.backLink}>Back to bookings</Text>
            </Pressable>
          </>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  loader: {
    marginTop: 40,
  },
  emptyText: {
    color: palette.muted,
    fontSize: 14,
    marginBottom: 8,
  },
  backLink: {
    color: palette.primary,
    fontSize: 14,
    fontWeight: typography.weight.semibold,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  bookingNumber: {
    color: palette.text,
    fontSize: 20,
    fontWeight: typography.weight.bold,
  },
  sectionTitle: {
    color: palette.text,
    fontSize: 15,
    fontWeight: typography.weight.semibold,
    marginBottom: 10,
  },
  line: {
    color: palette.text,
    fontSize: 15,
  },
  lineMuted: {
    color: palette.muted,
    fontSize: 14,
  },
  callLink: {
    color: palette.primary,
    fontSize: 14,
    fontWeight: typography.weight.semibold,
    marginTop: 6,
  },
  serviceRow: {
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  strike: {
    color: palette.muted,
    fontSize: 14,
    textDecorationLine: 'line-through',
  },
  discount: {
    color: '#2f7a3e',
    fontSize: 14,
  },
  totalRow: {
    borderTopColor: palette.border,
    borderTopWidth: 1,
    marginTop: 10,
    paddingTop: 10,
  },
  totalLabel: {
    color: palette.text,
    fontSize: 16,
    fontWeight: typography.weight.bold,
  },
  hint: {
    color: palette.muted,
    fontSize: 12,
    marginTop: 8,
  },
  footer: {
    gap: 10,
    marginTop: 8,
    marginBottom: 24,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: palette.primary,
    borderRadius: 16,
    paddingVertical: 14,
  },
  primaryButtonLabel: {
    color: palette.surface,
    fontSize: 15,
    fontWeight: typography.weight.semibold,
  },
  secondaryButton: {
    alignItems: 'center',
    borderColor: palette.border,
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 14,
  },
  secondaryButtonLabel: {
    color: palette.text,
    fontSize: 15,
    fontWeight: typography.weight.semibold,
  },
});
