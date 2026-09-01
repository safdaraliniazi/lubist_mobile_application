import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { VendorBookingsScreen } from '@/features/vendor/screens/VendorBookingsScreen';
import { VendorDashboardScreen } from '@/features/vendor/screens/VendorDashboardScreen';
import { VendorProfileScreen } from '@/features/vendor/screens/VendorProfileScreen';
import { VendorServicesScreen } from '@/features/vendor/screens/VendorServicesScreen';
import { palette } from '@/theme/palette';

import { VendorTabParamList } from './navigation.types';

const Tab = createBottomTabNavigator<VendorTabParamList>();

export function VendorNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: palette.primary,
        tabBarInactiveTintColor: palette.muted,
        tabBarStyle: {
          backgroundColor: palette.surface,
          borderTopColor: palette.border,
        },
        tabBarIcon: ({ color, size }) => {
          const iconMap = {
            Dashboard: 'grid-outline',
            Profile: 'person-circle-outline',
            Services: 'cut-outline',
            Bookings: 'calendar-outline',
          } as const;

          return <Ionicons name={iconMap[route.name]} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={VendorDashboardScreen} />
      <Tab.Screen name="Profile" component={VendorProfileScreen} />
      <Tab.Screen name="Services" component={VendorServicesScreen} />
      <Tab.Screen name="Bookings" component={VendorBookingsScreen} />
    </Tab.Navigator>
  );
}
