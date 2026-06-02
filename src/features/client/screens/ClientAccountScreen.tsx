import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Props = {
  icon: keyof typeof Ionicons.glyphMap;
  subtitle: string;
  title: string;
};

function PlaceholderPanel({ icon, subtitle, title }: Props) {
  return (
    <View style={styles.panel}>
      <View style={styles.iconWrap}>
        <Ionicons color="#bf7021" name={icon} size={22} />
      </View>
      <Text style={styles.panelTitle}>{title}</Text>
      <Text style={styles.panelSubtitle}>{subtitle}</Text>
    </View>
  );
}

export function ClientAccountScreen() {
  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Saved</Text>
        <Text style={styles.subtitle}>
          Keep your favorite salons, packages, and rituals in one place.
        </Text>

        <PlaceholderPanel
          icon="heart-outline"
          subtitle="Your shortlisted beauty spaces will appear here."
          title="Favorite salons"
        />
        <PlaceholderPanel
          icon="bookmark-outline"
          subtitle="Save service combinations and revisit them anytime."
          title="Saved services"
        />
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
  panel: {
    backgroundColor: '#fffaf4',
    borderColor: '#eadccf',
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 14,
    padding: 18,
  },
  iconWrap: {
    alignItems: 'center',
    backgroundColor: '#fde9d6',
    borderRadius: 16,
    height: 42,
    justifyContent: 'center',
    marginBottom: 12,
    width: 42,
  },
  panelTitle: {
    color: '#2f221a',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
  },
  panelSubtitle: {
    color: '#7d6d63',
    fontSize: 14,
    lineHeight: 21,
  },
});
