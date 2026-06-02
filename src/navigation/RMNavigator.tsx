import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { RMHomeScreen } from '@/features/rm/screens/RMHomeScreen';

import { RMStackParamList } from './navigation.types';

const Stack = createNativeStackNavigator<RMStackParamList>();

export function RMNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="RMHome" component={RMHomeScreen} options={{ title: 'Relationship Manager' }} />
    </Stack.Navigator>
  );
}
