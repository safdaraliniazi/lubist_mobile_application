import { useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '@/store/AuthContext';

const collageImages = [
  // Replace these remote placeholders with brand-approved local assets when available.
  'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=900&q=80',
];

const colors = {
  background: '#f7f0e8',
  card: '#fffaf4',
  cardShadow: '#c8b29e',
  text: '#2b221d',
  muted: '#7b6d63',
  subtle: '#b39c8d',
  border: '#eadfd4',
  input: '#f2e7da',
  gold: '#d48b37',
  goldDark: '#b76b1e',
  white: '#ffffff',
};

export function SignInScreen() {
  const { signIn } = useAuth();
  const { height } = useWindowDimensions();
  const [phoneNumber, setPhoneNumber] = useState('');

  const collageHeight = Math.min(Math.max(height * 0.4, 260), 340);
  const isContinueEnabled = phoneNumber.length >= 10;

  return (
    <SafeAreaView edges={['top', 'left', 'right', 'bottom']} style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardShell}
      >
        <View style={styles.screen}>
          <View style={[styles.collage, { height: collageHeight }]}>
            <View style={styles.column}>
              <Image source={{ uri: collageImages[0] }} style={[styles.imageTile, styles.leftTop]} />
              <Image
                source={{ uri: collageImages[2] }}
                style={[styles.imageTile, styles.leftBottom]}
              />
            </View>

            <View style={styles.column}>
              <Image
                source={{ uri: collageImages[1] }}
                style={[styles.imageTile, styles.rightTop]}
              />
              <Image
                source={{ uri: collageImages[3] }}
                style={[styles.imageTile, styles.rightBottom]}
              />
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.logoWrap}>
              <Text style={styles.logoMark}>✦</Text>
              <Text style={styles.brand}>LUBIST</Text>
              <Text style={styles.brandSub}>BEAUTY & SPA SALON</Text>
              <Text style={styles.tagline}>Luxury You Aspire</Text>
            </View>

            <View style={styles.form}>
              <View style={styles.phoneInputShell}>
                <Pressable style={styles.countryCode}>
                  <Text style={styles.countryCodeText}>+91</Text>
                  <Text style={styles.countryArrow}>⌄</Text>
                </Pressable>
                <View style={styles.divider} />
                <TextInput
                  keyboardType="number-pad"
                  maxLength={10}
                  onChangeText={(value) => setPhoneNumber(value.replace(/[^\d]/g, ''))}
                  placeholder="Enter Mobile Number"
                  placeholderTextColor={colors.subtle}
                  style={styles.input}
                  value={phoneNumber}
                />
              </View>

              <Pressable
                disabled={!isContinueEnabled}
                onPress={() => signIn('client')}
                style={({ pressed }) => [
                  styles.continueButton,
                  !isContinueEnabled && styles.continueButtonDisabled,
                  pressed && isContinueEnabled && styles.continueButtonPressed,
                ]}
              >
                <Text style={styles.continueButtonText}>CONTINUE</Text>
              </Pressable>
            </View>

            <Text style={styles.termsText}>
              By continuing you agree to our{' '}
              <Text style={styles.linkText}>Terms of Service</Text> and{' '}
              <Text style={styles.linkText}>Privacy Policy</Text>
            </Text>

            <Pressable style={styles.footerAction}>
              <Text style={styles.footerText}>
                Having issues signing up? <Text style={styles.footerLink}>Contact Support</Text>
              </Text>
            </Pressable>

            <Pressable onPress={() => signIn('client')} style={styles.footerAction}>
              <Text style={styles.footerText}>Continue as guest</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.background,
    flex: 1,
  },
  keyboardShell: {
    flex: 1,
  },
  screen: {
    backgroundColor: colors.background,
    flex: 1,
    justifyContent: 'space-between',
  },
  collage: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  column: {
    flex: 1,
    gap: 10,
  },
  imageTile: {
    borderRadius: 12,
    width: '100%',
  },
  leftTop: {
    flex: 1.08,
  },
  leftBottom: {
    flex: 0.92,
  },
  rightTop: {
    flex: 0.9,
  },
  rightBottom: {
    flex: 1.1,
  },
  card: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    elevation: 10,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 18,
    shadowColor: colors.cardShadow,
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 20,
  },
  logoWrap: {
    alignItems: 'center',
    marginBottom: 22,
  },
  logoMark: {
    color: colors.gold,
    fontSize: 28,
    marginBottom: 6,
  },
  brand: {
    color: colors.goldDark,
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: 4,
  },
  brandSub: {
    color: colors.goldDark,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 2.2,
    marginTop: 4,
  },
  tagline: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '700',
    marginTop: 16,
  },
  form: {
    gap: 14,
  },
  phoneInputShell: {
    alignItems: 'center',
    backgroundColor: colors.input,
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    height: 54,
    overflow: 'hidden',
  },
  countryCode: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
    height: '100%',
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  countryCodeText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
  },
  countryArrow: {
    color: colors.muted,
    fontSize: 16,
    marginTop: -2,
  },
  divider: {
    backgroundColor: '#d4c2b4',
    height: 24,
    width: 1,
  },
  input: {
    color: colors.text,
    flex: 1,
    fontSize: 15,
    height: '100%',
    paddingHorizontal: 14,
  },
  continueButton: {
    alignItems: 'center',
    backgroundColor: colors.gold,
    borderRadius: 12,
    height: 52,
    justifyContent: 'center',
    shadowColor: colors.gold,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.18,
    shadowRadius: 16,
  },
  continueButtonDisabled: {
    opacity: 0.55,
  },
  continueButtonPressed: {
    backgroundColor: colors.goldDark,
  },
  continueButtonText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 1.6,
  },
  termsText: {
    color: colors.muted,
    fontSize: 12.5,
    lineHeight: 20,
    marginTop: 18,
    paddingHorizontal: 8,
    textAlign: 'center',
  },
  linkText: {
    color: colors.goldDark,
    textDecorationLine: 'underline',
  },
  footerAction: {
    alignItems: 'center',
    marginTop: 12,
  },
  footerText: {
    color: colors.muted,
    fontSize: 13.5,
    lineHeight: 20,
    textAlign: 'center',
  },
  footerLink: {
    color: colors.text,
    fontWeight: '600',
  },
});
