import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { ClientAccountScreen } from '@/features/client/screens/ClientAccountScreen';
import { ClientAppointmentsScreen } from '@/features/client/screens/ClientAppointmentsScreen';
import { ClientDiscoverScreen } from '@/features/client/screens/ClientDiscoverScreen';
import { ClientHomeScreen } from '@/features/client/screens/ClientHomeScreen';
import { ClientShoppingScreen } from '@/features/client/screens/ClientShoppingScreen';
import { palette } from '@/theme/palette';

import { ClientTabParamList } from './navigation.types';

const Tab = createBottomTabNavigator<ClientTabParamList>();

export function ClientNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: palette.primary,
        tabBarInactiveTintColor: palette.muted,
        tabBarStyle: {
          backgroundColor: '#fffaf4',
          borderTopColor: 'transparent',
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          elevation: 16,
          height: 68,
          left: 12,
          paddingBottom: 8,
          paddingTop: 8,
          position: 'absolute',
          right: 12,
          shadowColor: '#c0a995',
          shadowOffset: {
            width: 0,
            height: -4,
          },
          shadowOpacity: 0.15,
          shadowRadius: 18,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: -2,
        },
        tabBarIcon: ({ color, size }) => {
          const iconMap = {
            Home: 'home-outline',
            Discover: 'compass-outline',
            Bookings: 'calendar-outline',
            Saved: 'heart-outline',
            Shopping: 'bag-handle-outline',
          } as const;

          return <Ionicons name={iconMap[route.name]} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={ClientHomeScreen} />
      <Tab.Screen name="Discover" component={ClientDiscoverScreen} />
      <Tab.Screen name="Bookings" component={ClientAppointmentsScreen} />
      <Tab.Screen name="Saved" component={ClientAccountScreen} />
      <Tab.Screen name="Shopping" component={ClientShoppingScreen} />
    </Tab.Navigator>
  );
}
