import { RouteProp, useRoute } from '@react-navigation/native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ClientStackParamList } from '@/navigation/navigation.types';

type BookingRoute = RouteProp<ClientStackParamList, 'BookingPlaceholder'>;

export function ClientBookingPlaceholderScreen() {
  const route = useRoute<BookingRoute>();

  return (
    <SafeAreaView edges={['top', 'left', 'right', 'bottom']} style={styles.safeArea}>
      <View style={styles.content}>
        <Text style={styles.title}>Booking flow coming next</Text>
        <Text style={styles.subtitle}>
          {route.params?.salonName
            ? `Service selection for ${route.params.salonName} will open here.`
            : 'Service selection will open here.'}
        </Text>

        <Pressable style={styles.button}>
          <Text style={styles.buttonText}>Continue</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#f7f0e8',
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    color: '#2f221a',
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    color: '#7d6d63',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 22,
    textAlign: 'center',
  },
  button: {
    alignItems: 'center',
    backgroundColor: '#d88a37',
    borderRadius: 12,
    height: 54,
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
