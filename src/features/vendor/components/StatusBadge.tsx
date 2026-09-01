import { StyleSheet, Text, View } from 'react-native';

import { typography } from '@/theme/typography';

export type BookingDisplayStatus =
  | 'pending'
  | 'confirmed'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'no_show';

const STATUS_CONFIG: Record<BookingDisplayStatus, { label: string; bg: string; fg: string }> = {
  pending: { label: 'Waiting', bg: '#fdf1de', fg: '#a3691a' },
  confirmed: { label: 'Confirmed', bg: '#e3f0e5', fg: '#2f7a3e' },
  in_progress: { label: 'In Progress', bg: '#e6edfb', fg: '#3454a8' },
  completed: { label: 'Completed', bg: '#e6edfb', fg: '#3454a8' },
  cancelled: { label: 'Cancelled', bg: '#f6e3e1', fg: '#a83a2f' },
  no_show: { label: 'No Show', bg: '#f0e6e1', fg: '#8a5a3a' },
};

/**
 * A `confirmed` booking whose date is today displays as "In Progress" — this
 * is a display-only transform (the stored status stays `confirmed`), matching
 * the web app's `getDisplayStatusKey`.
 */
export function getBookingDisplayStatus(status: string, bookingDate?: string): BookingDisplayStatus {
  if (status === 'confirmed' && bookingDate) {
    const today = new Date().toISOString().slice(0, 10);
    if (bookingDate === today) return 'in_progress';
  }
  return (STATUS_CONFIG[status as BookingDisplayStatus] ? status : 'pending') as BookingDisplayStatus;
}

export function StatusBadge({ status }: { status: BookingDisplayStatus }) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;
  return (
    <View style={[styles.badge, { backgroundColor: config.bg }]}>
      <Text style={[styles.label, { color: config.fg }]}>{config.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  label: {
    fontSize: 12,
    fontWeight: typography.weight.semibold,
  },
});
