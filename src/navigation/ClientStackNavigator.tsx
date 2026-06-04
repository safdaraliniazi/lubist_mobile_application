import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { ClientNavigator } from '@/navigation/ClientNavigator';
import { SalonDetailsScreen } from '@/features/client/screens/SalonDetailsScreen';
import { SalonServicesScreen } from '@/features/client/screens/SalonServicesScreen';
import { SelectTimeScreen } from '@/features/client/screens/SelectTimeScreen';
import { CheckoutScreen } from '@/features/client/screens/CheckoutScreen';
import { BookingConfirmedScreen } from '@/features/client/screens/BookingConfirmedScreen';

import { ClientStackParamList } from './navigation.types';

const Stack = createNativeStackNavigator<ClientStackParamList>();

export function ClientStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen component={ClientNavigator} name="Tabs" />
      <Stack.Screen component={SalonDetailsScreen} name="SalonDetails" />
      <Stack.Screen component={SalonServicesScreen} name="SalonServices" />
      <Stack.Screen component={SelectTimeScreen} name="SelectTime" />
      <Stack.Screen component={CheckoutScreen} name="Checkout" />
      <Stack.Screen component={BookingConfirmedScreen} name="BookingConfirmed" />
    </Stack.Navigator>
  );
}
