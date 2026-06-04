import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { ClientStackParamList } from '@/navigation/navigation.types';

const dates = [
  { id: 'sat', label: 'SAT 23 MAY' },
  { id: 'sun', label: 'SUN 24' },
  { id: 'mon', label: 'MON 25' },
  { id: 'tue', label: 'TUE 26' },
  { id: 'wed', label: 'WED 27' },
];

const timeSlots = [
  { id: 't1', label: '04:00 PM' },
  { id: 't2', label: '04:15 PM' },
  { id: 't3', label: '04:30 PM' },
  { id: 't4', label: '04:45 PM' },
  { id: 't5', label: '05:00 PM' },
  { id: 't6', label: '05:15 PM', disabled: true },
  { id: 't7', label: '05:30 PM' },
  { id: 't8', label: '05:45 PM' },
  { id: 't9', label: '06:00 PM' },
];

const colors = {
  bg: '#FFFAF5',
  header: '#FCFCFB',
  white: '#FFFFFF',
  ink: '#1C1B1B',
  title: '#221A11',
  iconDark: '#0B0C0C',
  muted: '#747878',
  muted2: '#444748',
  border: '#EAEAEA',
  circleBtn: '#F7F3F2',
  infoBg: '#F1EDEC',
  gold: '#F89E07',
  noteBorder: 'rgba(234, 234, 234, 0.5)',
  ctaShell: 'rgba(252, 252, 251, 0.9)',
};

type Navigation = NativeStackNavigationProp<ClientStackParamList>;
type Route = RouteProp<ClientStackParamList, 'SelectTime'>;

export function SelectTimeScreen() {
  const navigation = useNavigation<Navigation>();
  const route = useRoute<Route>();
  const serviceName = route.params?.serviceName ?? 'Haircut';

  const [activeDate, setActiveDate] = useState('sat');
  const [selectedTimes, setSelectedTimes] = useState<string[]>([]);

  const toggleTime = (id: string) => {
    setSelectedTimes((prev) => {
      if (prev.includes(id)) {
        return prev.filter((time) => time !== id);
      }
      if (prev.length >= 3) {
        return prev;
      }
      return [...prev, id];
    });
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.headerButton}>
          <Ionicons color={colors.iconDark} name="chevron-back" size={22} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Shreya Ganotra Studio</Text>
          <Text style={styles.headerSubtitle}>Patel Nagar, Delhi</Text>
        </View>
        <Pressable style={styles.circleButton}>
          <Ionicons color={colors.iconDark} name="share-social-outline" size={18} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <View style={styles.dateDropdown}>
            <View style={styles.dateDropdownLeft}>
              <Text style={styles.dateToday}>Today</Text>
              <Text style={styles.datePipe}>|</Text>
              <Text style={styles.dateFull}>23 May, Saturday, 2026</Text>
            </View>
            <Ionicons color={colors.muted} name="chevron-down" size={18} />
          </View>

          <ScrollView
            contentContainerStyle={styles.dateRow}
            horizontal
            showsHorizontalScrollIndicator={false}
          >
            {dates.map((date) => {
              const isActive = date.id === activeDate;

              return (
                <Pressable
                  key={date.id}
                  onPress={() => setActiveDate(date.id)}
                  style={[styles.datePill, isActive ? styles.datePillActive : styles.datePillIdle]}
                >
                  <Text style={[styles.datePillText, isActive && styles.datePillTextActive]}>
                    {date.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <View style={styles.timeSection}>
            <View style={styles.infoBanner}>
              <Ionicons color={colors.muted} name="information-circle-outline" size={14} />
              <Text style={styles.infoText}>You can select up-to 3 time slots</Text>
            </View>

            <View style={styles.timeGrid}>
              {timeSlots.map((slot) => {
                const isSelected = selectedTimes.includes(slot.id);

                return (
                  <Pressable
                    key={slot.id}
                    disabled={slot.disabled}
                    onPress={() => toggleTime(slot.id)}
                    style={[
                      styles.timeSlot,
                      isSelected && styles.timeSlotSelected,
                      slot.disabled && styles.timeSlotDisabled,
                    ]}
                  >
                    <Text style={[styles.timeText, isSelected && styles.timeTextSelected]}>
                      {slot.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.billTitle}>Bill Details</Text>

          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Hair Care | {serviceName}</Text>
            <Text style={styles.billValue}>₹472</Text>
          </View>

          <View style={styles.billTotalRow}>
            <Text style={styles.billTotalLabel}>Approx Total</Text>
            <Text style={styles.billTotalValue}>₹472</Text>
          </View>

          <View style={styles.noteBox}>
            <Text style={styles.noteText}>
              The total may vary after consultation depending on hair length and actual services
              availed.
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.ctaShell}>
        <Pressable
          onPress={() => navigation.navigate('Checkout', { serviceName })}
          style={styles.ctaButton}
        >
          <Text style={styles.ctaText}>Book & pay after services</Text>
        </Pressable>
        <Text style={styles.ctaLegal}>
          By continuing, you agree to our <Text style={styles.ctaLegalLink}>Terms</Text> &{' '}
          <Text style={styles.ctaLegalLink}>Privacy Policy</Text>
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.bg,
    flex: 1,
  },
  header: {
    alignItems: 'center',
    backgroundColor: colors.header,
    borderBottomColor: 'rgba(196, 199, 199, 0.2)',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  headerButton: {
    width: 36,
  },
  headerCenter: {
    alignItems: 'center',
    flex: 1,
  },
  headerTitle: {
    color: colors.title,
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 20,
  },
  headerSubtitle: {
    color: colors.muted,
    fontFamily: 'Montserrat_400Regular',
    fontSize: 12,
    marginTop: 2,
  },
  circleButton: {
    alignItems: 'center',
    backgroundColor: colors.circleBtn,
    borderRadius: 9999,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  scrollContent: {
    gap: 32,
    paddingBottom: 160,
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 24,
    elevation: 2,
    padding: 16,
    shadowColor: 'rgba(34, 34, 34, 0.04)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 20,
  },
  dateDropdown: {
    alignItems: 'center',
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 8,
  },
  dateDropdownLeft: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  dateToday: {
    color: colors.ink,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
  },
  datePipe: {
    color: colors.muted,
    fontFamily: 'Montserrat_400Regular',
    fontSize: 16,
  },
  dateFull: {
    color: colors.muted2,
    fontFamily: 'Montserrat_400Regular',
    fontSize: 15,
  },
  dateRow: {
    gap: 10,
    paddingRight: 8,
    paddingTop: 16,
  },
  datePill: {
    alignItems: 'center',
    borderRadius: 9999,
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 9,
  },
  datePillActive: {
    backgroundColor: colors.iconDark,
  },
  datePillIdle: {
    borderColor: colors.border,
    borderWidth: 1,
  },
  datePillText: {
    color: colors.muted2,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    letterSpacing: 0.65,
  },
  datePillTextActive: {
    color: colors.white,
  },
  timeSection: {
    gap: 16,
    paddingTop: 16,
  },
  infoBanner: {
    alignItems: 'center',
    backgroundColor: colors.infoBg,
    borderRadius: 8,
    flexDirection: 'row',
    gap: 8,
    padding: 12,
  },
  infoText: {
    color: colors.muted2,
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
  },
  timeGrid: {
    columnGap: 8,
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: 12,
  },
  timeSlot: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 12,
    width: '31.5%',
  },
  timeSlotSelected: {
    backgroundColor: colors.iconDark,
    borderColor: colors.iconDark,
  },
  timeSlotDisabled: {
    opacity: 0.5,
  },
  timeText: {
    color: colors.ink,
    fontFamily: 'Poppins_400Regular',
    fontSize: 15,
  },
  timeTextSelected: {
    color: colors.white,
  },
  billTitle: {
    color: colors.ink,
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 20,
  },
  billRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 8,
  },
  billLabel: {
    color: colors.muted2,
    fontFamily: 'Montserrat_400Regular',
    fontSize: 15,
  },
  billValue: {
    color: colors.ink,
    fontFamily: 'Montserrat_400Regular',
    fontSize: 15,
  },
  billTotalRow: {
    alignItems: 'center',
    borderTopColor: colors.border,
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 8,
  },
  billTotalLabel: {
    color: colors.ink,
    fontFamily: 'Montserrat_700Bold',
    fontSize: 17,
  },
  billTotalValue: {
    color: colors.ink,
    fontFamily: 'Montserrat_700Bold',
    fontSize: 17,
  },
  noteBox: {
    backgroundColor: colors.circleBtn,
    borderColor: colors.noteBorder,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 12,
    padding: 12,
  },
  noteText: {
    color: colors.muted2,
    fontFamily: 'Montserrat_400Regular',
    fontSize: 12,
    lineHeight: 16,
  },
  ctaShell: {
    backgroundColor: colors.ctaShell,
    borderTopColor: 'rgba(196, 199, 199, 0.2)',
    borderTopWidth: 1,
    bottom: 0,
    left: 0,
    paddingBottom: 16,
    paddingHorizontal: 24,
    paddingTop: 16,
    position: 'absolute',
    right: 0,
  },
  ctaButton: {
    alignItems: 'center',
    backgroundColor: colors.gold,
    borderRadius: 24,
    paddingVertical: 16,
  },
  ctaText: {
    color: colors.white,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
  },
  ctaLegal: {
    color: colors.muted,
    fontFamily: 'Montserrat_400Regular',
    fontSize: 12,
    marginTop: 12,
    textAlign: 'center',
  },
  ctaLegalLink: {
    color: colors.muted,
    textDecorationLine: 'underline',
  },
});
