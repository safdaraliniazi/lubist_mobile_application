import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { ClientStackParamList } from '@/navigation/navigation.types';

const colors = {
  bg: '#FFFAF5',
  gold: '#F89E07',
  text: '#534433',
  heading: '#221A11',
  divider: '#E7D7C9',
  white: '#FFFFFF',
};

type DetailRow = {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  sub?: string;
};

type Navigation = NativeStackNavigationProp<ClientStackParamList>;
type Route = RouteProp<ClientStackParamList, 'BookingConfirmed'>;

export function BookingConfirmedScreen() {
  const navigation = useNavigation<Navigation>();
  const route = useRoute<Route>();
  const service = route.params?.serviceName ?? 'Signature Hydrafacial';

  const details: DetailRow[] = [
    { id: 'date', icon: 'calendar-outline', label: 'Date', value: 'Thursday, Oct 12th' },
    { id: 'time', icon: 'time-outline', label: 'Time', value: '2:30 PM - 3:45 PM' },
    {
      id: 'location',
      icon: 'location-outline',
      label: 'Location',
      value: 'Aura Glow Spa',
      sub: '124 Main St, Suite 200',
    },
    { id: 'service', icon: 'cut-outline', label: 'Service', value: service },
  ];

  return (
    <SafeAreaView edges={['top', 'left', 'right', 'bottom']} style={styles.safeArea}>
      <View style={styles.content}>
        <View style={styles.hero}>
          <View style={styles.glow} />
          <Ionicons color={colors.gold} name="checkmark-circle" size={75} />
          <Text style={styles.title}>Booking Confirmed!</Text>
          <Text style={styles.subtitle}>Your appointment is set. Get ready for your glow!</Text>
        </View>

        <View style={styles.details}>
          {details.map((row, index) => (
            <View key={row.id}>
              {index > 0 ? <View style={styles.divider} /> : null}
              <View style={styles.row}>
                <Ionicons color={colors.gold} name={row.icon} size={20} style={styles.rowIcon} />
                <View style={styles.rowText}>
                  <Text style={styles.rowLabel}>{row.label}</Text>
                  <Text style={styles.rowValue}>{row.value}</Text>
                  {row.sub ? <Text style={styles.rowSub}>{row.sub}</Text> : null}
                </View>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.spacer} />

        <Pressable onPress={() => navigation.popToTop()} style={styles.doneButton}>
          <Text style={styles.doneText}>Done</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.bg,
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 17,
  },
  hero: {
    alignItems: 'center',
    marginTop: 48,
  },
  glow: {
    backgroundColor: colors.gold,
    borderRadius: 64,
    height: 126,
    opacity: 0.2,
    position: 'absolute',
    top: -24,
    width: 127,
  },
  title: {
    color: colors.gold,
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 22,
    letterSpacing: -0.44,
    marginTop: 18,
    textAlign: 'center',
  },
  subtitle: {
    color: colors.text,
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    lineHeight: 24,
    marginTop: 4,
    textAlign: 'center',
  },
  details: {
    gap: 15,
    marginTop: 40,
    paddingHorizontal: 20,
  },
  divider: {
    backgroundColor: colors.divider,
    height: 1,
    marginBottom: 15,
  },
  row: {
    flexDirection: 'row',
    gap: 16,
  },
  rowIcon: {
    marginTop: 2,
  },
  rowText: {
    flex: 1,
  },
  rowLabel: {
    color: colors.text,
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
  },
  rowValue: {
    color: colors.heading,
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    marginTop: 4,
  },
  rowSub: {
    color: colors.text,
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    lineHeight: 21,
  },
  spacer: {
    flex: 1,
  },
  doneButton: {
    alignItems: 'center',
    backgroundColor: colors.gold,
    borderRadius: 12,
    justifyContent: 'center',
    marginBottom: 8,
    paddingVertical: 16,
  },
  doneText: {
    color: colors.white,
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    letterSpacing: 0.14,
  },
});
