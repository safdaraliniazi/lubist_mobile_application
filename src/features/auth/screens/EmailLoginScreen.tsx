import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { AuthStackParamList } from '@/navigation/navigation.types';
import { useAuth } from '@/store/AuthContext';
import { useLogin } from '@/services/api/hooks/useAuthAPI';

const colors = {
  bgTop: '#FFF8F4',
  bgMid: '#F0E0D1',
  bgBottom: '#FFFFFF',
  card: 'rgba(255, 248, 244, 0.95)',
  heading: '#221A11',
  text: '#534433',
  muted: 'rgba(83, 68, 51, 0.7)',
  label: '#534433',
  inputBg: '#F6E5D7',
  inputBorder: '#F0E0D1',
  placeholder: 'rgba(83, 68, 51, 0.5)',
  ctaStart: '#F89E07',
  ctaEnd: '#FFB962',
  ctaShadow: 'rgba(248, 158, 7, 0.25)',
  ctaText: '#FFFFFF',
  link: '#865300',
  backBtn: '#FFF1E6',
};

type Navigation = NativeStackNavigationProp<AuthStackParamList, 'EmailLogin'>;

export function EmailLoginScreen() {
  const { signIn } = useAuth();
  const navigation = useNavigation<Navigation>();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const { mutate: loginUser, isPending } = useLogin();
  const isValid = /^\S+@\S+\.\S+$/.test(email) && password.length >= 1 && !isPending;

  const handleLogin = () => {
    loginUser(
      { email, password },
      {
        onSuccess: (data) => {
          // Logged in! Call signIn to update Context state
          signIn('client');
        },
        onError: (error: any) => {
          Alert.alert('Login Failed', error.message || 'Invalid email or password.');
        }
      }
    );
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right', 'bottom']} style={styles.safeArea}>
      <LinearGradient colors={[colors.bgTop, colors.bgMid, colors.bgBottom]} style={styles.gradient}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.flex}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Ionicons color={colors.heading} name="arrow-back" size={22} />
            </Pressable>

            <View style={styles.heading}>
              <Text style={styles.title}>Welcome back</Text>
              <Text style={styles.subtitle}>Log in with your email and password.</Text>
            </View>

            <View style={styles.card}>
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>Email</Text>
                <View style={styles.inputWrap}>
                  <Ionicons color={colors.muted} name="mail-outline" size={18} />
                  <TextInput
                    autoCapitalize="none"
                    keyboardType="email-address"
                    onChangeText={setEmail}
                    placeholder="you@example.com"
                    placeholderTextColor={colors.placeholder}
                    style={styles.input}
                    value={email}
                  />
                </View>
              </View>

              <View style={styles.field}>
                <Text style={styles.fieldLabel}>Password</Text>
                <View style={styles.inputWrap}>
                  <Ionicons color={colors.muted} name="lock-closed-outline" size={18} />
                  <TextInput
                    autoCapitalize="none"
                    onChangeText={setPassword}
                    placeholder="Your password"
                    placeholderTextColor={colors.placeholder}
                    secureTextEntry={!showPassword}
                    style={styles.input}
                    value={password}
                  />
                  <Pressable onPress={() => setShowPassword((s) => !s)}>
                    <Ionicons
                      color={colors.muted}
                      name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={18}
                    />
                  </Pressable>
                </View>
              </View>

              <Pressable
                onPress={() => navigation.navigate('ForgotPassword')}
                style={styles.forgotWrap}
              >
                <Text style={styles.forgotText}>Forgot password?</Text>
              </Pressable>

              <Pressable
                disabled={!isValid}
                onPress={handleLogin}
                style={({ pressed }) => [
                  styles.ctaShadow,
                  !isValid && styles.ctaDisabled,
                  pressed && isValid && styles.ctaPressed,
                ]}
              >
                <LinearGradient
                  colors={[colors.ctaStart, colors.ctaEnd]}
                  end={{ x: 1, y: 0 }}
                  start={{ x: 0, y: 0 }}
                  style={styles.cta}
                >
                  <Text style={styles.ctaText}>{isPending ? 'LOGGING IN...' : 'LOG IN'}</Text>
                </LinearGradient>
              </Pressable>

              <View style={styles.signupRow}>
                <Text style={styles.signupText}>New to Lubist? </Text>
                <Pressable onPress={() => navigation.navigate('Signup', {})}>
                  <Text style={styles.signupLink}>Create account</Text>
                </Pressable>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.bgTop,
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  backBtn: {
    alignItems: 'center',
    backgroundColor: colors.backBtn,
    borderRadius: 12,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  heading: {
    marginBottom: 20,
    marginTop: 24,
  },
  title: {
    color: colors.heading,
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 26,
    letterSpacing: -0.5,
  },
  subtitle: {
    color: colors.muted,
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    lineHeight: 21,
    marginTop: 6,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 28,
    elevation: 8,
    padding: 20,
    shadowColor: 'rgba(134, 83, 0, 0.12)',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 1,
    shadowRadius: 30,
  },
  field: {
    gap: 8,
    marginBottom: 16,
  },
  fieldLabel: {
    color: colors.label,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
  },
  inputWrap: {
    alignItems: 'center',
    backgroundColor: colors.inputBg,
    borderColor: colors.inputBorder,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    height: 54,
    paddingHorizontal: 16,
  },
  input: {
    color: colors.heading,
    flex: 1,
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    height: '100%',
  },
  forgotWrap: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  forgotText: {
    color: colors.link,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
  },
  ctaShadow: {
    borderRadius: 12,
    elevation: 8,
    shadowColor: colors.ctaShadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 20,
  },
  ctaDisabled: {
    opacity: 0.55,
  },
  ctaPressed: {
    opacity: 0.9,
  },
  cta: {
    alignItems: 'center',
    borderRadius: 12,
    height: 56,
    justifyContent: 'center',
  },
  ctaText: {
    color: colors.ctaText,
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    letterSpacing: 0.7,
  },
  signupRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  signupText: {
    color: colors.muted,
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
  },
  signupLink: {
    color: colors.link,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
  },
});
