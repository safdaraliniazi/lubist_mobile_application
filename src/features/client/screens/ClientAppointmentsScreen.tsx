import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const bookings = [
  {
    id: 'book-1',
    title: 'Glow Facial',
    salon: 'Maison Glow Atelier',
    date: 'Today, 6:00 PM',
  },
  {
    id: 'book-2',
    title: 'Hair Cut + Blow Dry',
    salon: 'Lumina Studio',
    date: 'May 24, 11:30 AM',
  },
];

export function ClientAppointmentsScreen() {
  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Bookings</Text>
        <Text style={styles.subtitle}>Track upcoming salon visits, reschedule, or check details.</Text>

        <View style={styles.list}>
          {bookings.map((booking) => (
            <View key={booking.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.iconWrap}>
                  <Ionicons color="#bf7021" name="calendar-outline" size={18} />
                </View>
                <Text style={styles.cardDate}>{booking.date}</Text>
              </View>

              <Text style={styles.cardTitle}>{booking.title}</Text>
              <Text style={styles.cardSalon}>{booking.salon}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#f7f0e8',
    flex: 1,
  },
  content: {
    paddingBottom: 112,
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  title: {
    color: '#2f221a',
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 8,
  },
  subtitle: {
    color: '#7d6d63',
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 20,
  },
  list: {
    gap: 14,
  },
  card: {
    backgroundColor: '#fffaf4',
    borderColor: '#eadccf',
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
  },
  cardHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  iconWrap: {
    alignItems: 'center',
    backgroundColor: '#fde9d6',
    borderRadius: 12,
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
  cardDate: {
    color: '#bf7021',
    fontSize: 13,
    fontWeight: '700',
  },
  cardTitle: {
    color: '#2f221a',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  cardSalon: {
    color: '#7d6d63',
    fontSize: 14,
  },
});
