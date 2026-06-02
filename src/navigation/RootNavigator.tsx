import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useAuth } from '@/store/AuthContext';

import { AdminNavigator } from './AdminNavigator';
import { AuthNavigator } from './AuthNavigator';
import { ClientStackNavigator } from './ClientStackNavigator';
import { RMNavigator } from './RMNavigator';
import { RootStackParamList } from './navigation.types';
import { VendorNavigator } from './VendorNavigator';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const { isAuthenticated, role } = useAuth();

  if (!isAuthenticated || role === null) {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Auth" component={AuthNavigator} />
      </Stack.Navigator>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {role === 'vendor' ? (
        <Stack.Screen name="Vendor" component={VendorNavigator} />
      ) : role === 'client' ? (
        <Stack.Screen name="Client" component={ClientStackNavigator} />
      ) : role === 'admin' ? (
        <Stack.Screen name="Admin" component={AdminNavigator} />
      ) : role === 'rm' ? (
        <Stack.Screen name="RM" component={RMNavigator} />
      ) : (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      )}
    </Stack.Navigator>
  );
}
