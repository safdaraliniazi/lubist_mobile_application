import { StyleSheet, Text, View } from 'react-native';

import { MetricCard } from '@/shared/components/MetricCard';
import { Screen } from '@/shared/components/Screen';
import { palette } from '@/theme/palette';
import { typography } from '@/theme/typography';

const metrics = [
  { label: 'Today bookings', value: '24' },
  { label: 'Pending payouts', value: '$860' },
  { label: 'Staff on shift', value: '8' },
];

export function VendorDashboardScreen() {
  return (
    <Screen scrollable>
      <View style={styles.hero}>
        <Text style={styles.title}>Vendor Dashboard</Text>
        <Text style={styles.subtitle}>Track salon performance, active staff, and booking demand.</Text>
      </View>

      <View style={styles.grid}>
        {metrics.map((metric) => (
          <MetricCard key={metric.label} label={metric.label} value={metric.value} />
        ))}
      </View>
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
  grid: {
    gap: 14,
  },
});
