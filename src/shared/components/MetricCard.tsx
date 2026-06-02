import { StyleSheet, Text, View } from 'react-native';

import { palette } from '@/theme/palette';
import { typography } from '@/theme/typography';

type MetricCardProps = {
  label: string;
  value: string;
};

export function MetricCard({ label, value }: MetricCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: palette.surface,
    borderColor: palette.border,
    borderRadius: 24,
    borderWidth: 1,
    padding: 18,
  },
  value: {
    color: palette.text,
    fontSize: 28,
    fontWeight: typography.weight.bold,
  },
  label: {
    color: palette.muted,
    fontSize: 14,
    marginTop: 8,
  },
});
