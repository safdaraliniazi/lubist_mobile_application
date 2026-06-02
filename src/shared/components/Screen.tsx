import { PropsWithChildren } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { palette } from '@/theme/palette';

type ScreenProps = PropsWithChildren<{
  scrollable?: boolean;
}>;

export function Screen({ children, scrollable = false }: ScreenProps) {
  if (scrollable) {
    return <ScrollView contentContainerStyle={styles.scrollContent}>{children}</ScrollView>;
  }

  return <View style={styles.content}>{children}</View>;
}

const styles = StyleSheet.create({
  content: {
    backgroundColor: palette.background,
    flex: 1,
    padding: 20,
  },
  scrollContent: {
    backgroundColor: palette.background,
    flexGrow: 1,
    padding: 20,
  },
});
