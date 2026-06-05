import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { PropsWithChildren } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { AuthProvider } from '@/store/AuthContext';
import { navigationTheme } from '@/theme/navigationTheme';

const mergedTheme = {
  ...DefaultTheme,
  ...navigationTheme,
};

const queryClient = new QueryClient();

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <NavigationContainer theme={mergedTheme}>{children}</NavigationContainer>
        </AuthProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
