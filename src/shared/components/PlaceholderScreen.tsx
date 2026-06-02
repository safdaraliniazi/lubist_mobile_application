import { PropsWithChildren } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Screen } from '@/shared/components/Screen';
import { palette } from '@/theme/palette';
import { typography } from '@/theme/typography';

type PlaceholderScreenProps = PropsWithChildren<{
  title: string;
}>;

export function PlaceholderScreen({ children, title }: PlaceholderScreenProps) {
  return (
    <Screen>
      <View style={styles.card}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.body}>{children}</View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: palette.surface,
    borderColor: palette.border,
    borderRadius: 24,
    borderWidth: 1,
    gap: 12,
    padding: 20,
  },
  title: {
    color: palette.text,
    fontSize: 24,
    fontWeight: typography.weight.bold,
  },
  body: {
    gap: 8,
  },
});
