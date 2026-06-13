import { ActivityIndicator, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';

import type { RazorpayOrder } from '@/services/api/hooks/useBookingAPI';

export interface RazorpaySuccess {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface Props {
  visible: boolean;
  order: RazorpayOrder | null;
  prefill?: { name?: string; email?: string; contact?: string };
  description?: string;
  onSuccess: (result: RazorpaySuccess) => void;
  onDismiss: () => void;
  onError: (message: string) => void;
}

const esc = (s?: string) => (s ?? '').replace(/["\\]/g, '');

function buildHtml(order: RazorpayOrder, prefill: Props['prefill'], description: string) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
</head>
<body style="background:#FFFAF5">
  <script>
    function post(type, payload) {
      window.ReactNativeWebView.postMessage(JSON.stringify({ type: type, payload: payload }));
    }
    var options = {
      key: "${esc(order.key_id)}",
      order_id: "${esc(order.order_id)}",
      amount: ${order.amount_paise},
      currency: "${esc(order.currency)}",
      name: "Lubist",
      description: "${esc(description)}",
      prefill: {
        name: "${esc(prefill?.name)}",
        email: "${esc(prefill?.email)}",
        contact: "${esc(prefill?.contact)}"
      },
      theme: { color: "#F89E07" },
      handler: function (response) { post("success", response); },
      modal: { ondismiss: function () { post("dismiss", {}); }, escape: true }
    };
    try {
      var rzp = new Razorpay(options);
      rzp.on("payment.failed", function (resp) { post("error", resp.error || {}); });
      rzp.open();
    } catch (e) {
      post("error", { description: String(e) });
    }
  </script>
</body>
</html>`;
}

export function RazorpayCheckout({ visible, order, prefill, description = 'Salon booking', onSuccess, onDismiss, onError }: Props) {
  const handleMessage = (event: { nativeEvent: { data: string } }) => {
    try {
      const msg = JSON.parse(event.nativeEvent.data);
      if (msg.type === 'success') {
        onSuccess({
          razorpay_payment_id: msg.payload?.razorpay_payment_id,
          razorpay_order_id: msg.payload?.razorpay_order_id,
          razorpay_signature: msg.payload?.razorpay_signature,
        });
      } else if (msg.type === 'dismiss') {
        onDismiss();
      } else if (msg.type === 'error') {
        onError(msg.payload?.description || 'Payment failed. Please try again.');
      }
    } catch {
      onError('Unexpected payment response.');
    }
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onDismiss}>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <Pressable hitSlop={8} onPress={onDismiss}>
            <Ionicons color="#221A11" name="close" size={24} />
          </Pressable>
          <Text style={styles.title}>Secure Payment</Text>
          <View style={{ width: 24 }} />
        </View>
        {order ? (
          <WebView
            originWhitelist={['*']}
            source={{ html: buildHtml(order, prefill, description), baseUrl: 'https://checkout.razorpay.com' }}
            onMessage={handleMessage}
            javaScriptEnabled
            domStorageEnabled
            startInLoadingState
            renderLoading={() => (
              <View style={styles.loading}>
                <ActivityIndicator color="#F89E07" size="large" />
              </View>
            )}
          />
        ) : (
          <View style={styles.loading}>
            <ActivityIndicator color="#F89E07" size="large" />
          </View>
        )}
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safe: { backgroundColor: '#FFFAF5', flex: 1 },
  header: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderBottomColor: '#F3F4F6',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  title: { color: '#221A11', fontFamily: 'Montserrat_600SemiBold', fontSize: 16 },
  loading: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
});
