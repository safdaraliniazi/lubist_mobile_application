import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Screen } from '@/shared/components/Screen';
import { useAuth } from '@/store/AuthContext';
import { palette } from '@/theme/palette';
import { typography } from '@/theme/typography';

export function VendorProfileScreen() {
  const { signOut } = useAuth();

  return (
    <Screen>
      <View style={styles.panel}>
        <Text style={styles.title}>Luna Salon Studio</Text>
        <Text style={styles.meta}>4 branches • 18 professionals • Verified vendor</Text>
      </View>

      <Pressable onPress={signOut} style={styles.button}>
        <Text style={styles.buttonLabel}>Sign out</Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  panel: {
    backgroundColor: palette.surface,
    borderColor: palette.border,
    borderRadius: 24,
    borderWidth: 1,
    gap: 8,
    padding: 20,
  },
  title: {
    color: palette.text,
    fontSize: 24,
    fontWeight: typography.weight.bold,
  },
  meta: {
    color: palette.muted,
    fontSize: 15,
    lineHeight: 22,
  },
  button: {
    alignItems: 'center',
    backgroundColor: palette.primary,
    borderRadius: 16,
    marginTop: 20,
    paddingVertical: 14,
  },
  buttonLabel: {
    color: palette.surface,
    fontSize: 16,
    fontWeight: typography.weight.semibold,
  },
});
