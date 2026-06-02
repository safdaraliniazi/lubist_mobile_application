import { PropsWithChildren } from 'react';
import { StyleSheet, View } from 'react-native';

import { palette } from '@/theme/palette';

export function SurfaceCard({ children }: PropsWithChildren) {
  return <View style={styles.card}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: palette.surface,
    borderColor: palette.border,
    borderRadius: 24,
    borderWidth: 1,
    padding: 18,
  },
});
