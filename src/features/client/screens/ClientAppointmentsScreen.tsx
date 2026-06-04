import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { luminaStudio, maisonGlowAtelier, theGlowRoom } from '@/features/client/data/salons';
import type {
  ClientStackParamList,
  ClientTabParamList,
  SalonRouteData,
} from '@/navigation/navigation.types';

const topLumina = require('@/assets/home/top-lumina.png');
const nearbyGlow = require('@/assets/home/nearby-glow.png');
const nearbyLumiere = require('@/assets/home/nearby-lumiere.png');

const colors = {
  bg: '#FFFAF5',
  white: '#FFFFFF',
  gold: '#F89E07',
  heading: '#221A11',
  text: '#534433',
  muted: '#78716C',
  border: '#E7D7C9',
  tan: '#F0E0D1',
  cardCream2: '#FFF1E6',
  pillBorder: 'rgba(217, 195, 173, 0.3)',
  segmentBg: '#F0E0D1',
  green: '#2E7D32',
  greenBg: '#F0FDF4',
  greenBorder: '#BBF7D0',
  apptIcon: '#7B5548',
  apptIconBg: '#FDEDDF',
};

type Booking = {
  id: string;
  service: string;
  date: string;
  data: SalonRouteData;
  image: number;
  status: 'Confirmed' | 'Completed';
};

const upcoming: Booking[] = [
  {
    id: 'b1',
    service: 'Glow Facial',
    date: 'Today, 6:00 PM',
    data: maisonGlowAtelier,
    image: nearbyGlow,
    status: 'Confirmed',
  },
  {
    id: 'b2',
    service: 'Hair Cut + Blow Dry',
    date: 'May 24, 11:30 AM',
    data: luminaStudio,
    image: topLumina,
    status: 'Confirmed',
  },
];

const past: Booking[] = [
  {
    id: 'b3',
    service: 'Deep Tissue Massage',
    date: 'May 02, 4:00 PM',
    data: theGlowRoom,
    image: nearbyLumiere,
    status: 'Completed',
  },
];

type Tab = 'upcoming' | 'past';
type BookingsNavigation = BottomTabNavigationProp<ClientTabParamList>;

export function ClientAppointmentsScreen() {
  const navigation = useNavigation<BookingsNavigation>();
  const parent = navigation.getParent<NativeStackNavigationProp<ClientStackParamList>>();
  const [tab, setTab] = useState<Tab>('upcoming');
  const list = tab === 'upcoming' ? upcoming : past;

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Bookings</Text>
      </View>

      <View style={styles.segment}>
        <Pressable
          onPress={() => setTab('upcoming')}
          style={[styles.segmentButton, tab === 'upcoming' && styles.segmentActive]}
        >
          <Text style={[styles.segmentText, tab === 'upcoming' && styles.segmentTextActive]}>
            Upcoming
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setTab('past')}
          style={[styles.segmentButton, tab === 'past' && styles.segmentActive]}
        >
          <Text style={[styles.segmentText, tab === 'past' && styles.segmentTextActive]}>Past</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {list.length === 0 ? (
          <View style={styles.empty}>
            <View style={styles.emptyIcon}>
              <Ionicons color={colors.apptIcon} name="calendar-outline" size={26} />
            </View>
            <Text style={styles.emptyTitle}>No bookings here yet</Text>
            <Text style={styles.emptySubtitle}>Your {tab} salon visits will appear here.</Text>
          </View>
        ) : (
          <View style={styles.list}>
            {list.map((booking) => (
              <View key={booking.id} style={styles.card}>
                <View style={styles.cardTop}>
                  <Image source={booking.image} style={styles.thumb} />
                  <View style={styles.cardInfo}>
                    <Text style={styles.service}>{booking.service}</Text>
                    <Text style={styles.salon}>{booking.data.name}</Text>
                    <View style={styles.metaRow}>
                      <Ionicons color={colors.gold} name="time-outline" size={13} />
                      <Text style={styles.metaText}>{booking.date}</Text>
                    </View>
                  </View>
                  <View
                    style={[
                      styles.statusPill,
                      booking.status === 'Confirmed' ? styles.statusConfirmed : styles.statusDone,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        booking.status === 'Confirmed'
                          ? styles.statusTextConfirmed
                          : styles.statusTextDone,
                      ]}
                    >
                      {booking.status}
                    </Text>
                  </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.actions}>
                  {tab === 'upcoming' ? (
                    <>
                      <Pressable style={[styles.actionBtn, styles.actionOutline]}>
                        <Text style={styles.actionOutlineText}>Reschedule</Text>
                      </Pressable>
                      <Pressable
                        onPress={() => parent?.navigate('SalonDetails', { salon: booking.data })}
                        style={[styles.actionBtn, styles.actionPrimary]}
                      >
                        <Text style={styles.actionPrimaryText}>View Details</Text>
                      </Pressable>
                    </>
                  ) : (
                    <Pressable
                      onPress={() => parent?.navigate('SalonDetails', { salon: booking.data })}
                      style={[styles.actionBtn, styles.actionPrimary, styles.actionFull]}
                    >
                      <Ionicons color={colors.white} name="refresh" size={14} />
                      <Text style={styles.actionPrimaryText}>Book Again</Text>
                    </Pressable>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.bg,
    flex: 1,
  },
  header: {
    backgroundColor: colors.white,
    elevation: 3,
    paddingHorizontal: 16,
    paddingVertical: 18,
    shadowColor: 'rgba(248, 158, 7, 0.08)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 20,
  },
  headerTitle: {
    color: colors.heading,
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 22,
    letterSpacing: -0.2,
  },
  segment: {
    backgroundColor: colors.segmentBg,
    borderRadius: 14,
    flexDirection: 'row',
    margin: 16,
    padding: 4,
  },
  segmentButton: {
    alignItems: 'center',
    borderRadius: 10,
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 10,
  },
  segmentActive: {
    backgroundColor: colors.gold,
  },
  segmentText: {
    color: colors.text,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
  },
  segmentTextActive: {
    color: colors.white,
  },
  scrollContent: {
    paddingBottom: 120,
    paddingHorizontal: 16,
    paddingTop: 4,
  },
  list: {
    gap: 16,
  },
  card: {
    backgroundColor: colors.cardCream2,
    borderColor: colors.pillBorder,
    borderRadius: 16,
    borderWidth: 1,
    elevation: 3,
    padding: 14,
    shadowColor: 'rgba(44, 44, 44, 0.08)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 20,
  },
  cardTop: {
    flexDirection: 'row',
    gap: 12,
  },
  thumb: {
    borderRadius: 12,
    height: 64,
    width: 64,
  },
  cardInfo: {
    flex: 1,
    gap: 3,
  },
  service: {
    color: colors.heading,
    fontFamily: 'Poppins_700Bold',
    fontSize: 16,
  },
  salon: {
    color: colors.text,
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
  },
  metaRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
    marginTop: 2,
  },
  metaText: {
    color: colors.text,
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
  },
  statusPill: {
    alignSelf: 'flex-start',
    borderRadius: 9999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusConfirmed: {
    backgroundColor: colors.greenBg,
    borderColor: colors.greenBorder,
  },
  statusDone: {
    backgroundColor: colors.tan,
    borderColor: colors.border,
  },
  statusText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
  },
  statusTextConfirmed: {
    color: colors.green,
  },
  statusTextDone: {
    color: colors.muted,
  },
  divider: {
    backgroundColor: colors.border,
    height: 1,
    marginVertical: 14,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionBtn: {
    alignItems: 'center',
    borderRadius: 12,
    flex: 1,
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
    paddingVertical: 11,
  },
  actionFull: {
    flex: 1,
  },
  actionOutline: {
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderWidth: 1,
  },
  actionOutlineText: {
    color: colors.text,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
  },
  actionPrimary: {
    backgroundColor: colors.gold,
  },
  actionPrimaryText: {
    color: colors.white,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
  },
  empty: {
    alignItems: 'center',
    paddingTop: 64,
  },
  emptyIcon: {
    alignItems: 'center',
    backgroundColor: colors.apptIconBg,
    borderRadius: 20,
    height: 64,
    justifyContent: 'center',
    marginBottom: 16,
    width: 64,
  },
  emptyTitle: {
    color: colors.heading,
    fontFamily: 'Poppins_700Bold',
    fontSize: 18,
    marginBottom: 6,
  },
  emptySubtitle: {
    color: colors.text,
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
  },
});
