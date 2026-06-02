import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { ClientBookingPlaceholderScreen } from '@/features/client/screens/ClientBookingPlaceholderScreen';
import { ClientNavigator } from '@/navigation/ClientNavigator';
import { SalonDetailsScreen } from '@/features/client/screens/SalonDetailsScreen';

import { ClientStackParamList } from './navigation.types';

const Stack = createNativeStackNavigator<ClientStackParamList>();

export function ClientStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen component={ClientNavigator} name="Tabs" />
      <Stack.Screen component={SalonDetailsScreen} name="SalonDetails" />
      <Stack.Screen component={ClientBookingPlaceholderScreen} name="BookingPlaceholder" />
    </Stack.Navigator>
  );
}
