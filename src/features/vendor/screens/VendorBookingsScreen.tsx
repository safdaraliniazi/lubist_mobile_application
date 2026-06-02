import { StyleSheet, Text, View } from 'react-native';

import { Screen } from '@/shared/components/Screen';
import { SurfaceCard } from '@/shared/components/SurfaceCard';
import { palette } from '@/theme/palette';
import { typography } from '@/theme/typography';

const bookings = [
  { client: 'Ava Johnson', service: 'Hair Styling', time: '10:00 AM' },
  { client: 'Mia Wilson', service: 'Bridal Makeup', time: '12:30 PM' },
  { client: 'Noah Brown', service: 'Beard Grooming', time: '3:15 PM' },
];

export function VendorBookingsScreen() {
  return (
    <Screen scrollable>
      <Text style={styles.title}>Upcoming Bookings</Text>
      <View style={styles.list}>
        {bookings.map((booking) => (
          <SurfaceCard key={`${booking.client}-${booking.time}`}>
            <Text style={styles.client}>{booking.client}</Text>
            <Text style={styles.meta}>{booking.service}</Text>
            <Text style={styles.time}>{booking.time}</Text>
          </SurfaceCard>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    color: palette.text,
    fontSize: 26,
    fontWeight: typography.weight.bold,
    marginBottom: 20,
  },
  list: {
    gap: 12,
  },
  client: {
    color: palette.text,
    fontSize: 17,
    fontWeight: typography.weight.semibold,
  },
  meta: {
    color: palette.muted,
    fontSize: 14,
    marginTop: 4,
  },
  time: {
    color: palette.primary,
    fontSize: 14,
    fontWeight: typography.weight.medium,
    marginTop: 12,
  },
});
