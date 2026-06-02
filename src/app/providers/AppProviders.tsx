import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { PropsWithChildren } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider } from '@/store/AuthContext';
import { navigationTheme } from '@/theme/navigationTheme';

const mergedTheme = {
  ...DefaultTheme,
  ...navigationTheme,
};

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NavigationContainer theme={mergedTheme}>{children}</NavigationContainer>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
