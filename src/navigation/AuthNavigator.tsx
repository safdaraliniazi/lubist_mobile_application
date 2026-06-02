import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { SignInScreen } from '@/features/auth/screens/SignInScreen';

import { AuthStackParamList } from './navigation.types';

const Stack = createNativeStackNavigator<AuthStackParamList>();

export function AuthNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="SignIn"
        component={SignInScreen}
        options={{ title: 'Choose Workspace' }}
      />
    </Stack.Navigator>
  );
}
