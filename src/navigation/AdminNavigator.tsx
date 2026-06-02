import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { AdminHomeScreen } from '@/features/admin/screens/AdminHomeScreen';

import { AdminStackParamList } from './navigation.types';

const Stack = createNativeStackNavigator<AdminStackParamList>();

export function AdminNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="AdminHome" component={AdminHomeScreen} options={{ title: 'Admin' }} />
    </Stack.Navigator>
  );
}
