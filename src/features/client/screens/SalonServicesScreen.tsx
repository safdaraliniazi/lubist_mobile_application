import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { ClientStackParamList } from '@/navigation/navigation.types';

// Category circle images exported 1:1 from Figma ("Particular Salon's offered services").
const categories = [
  { id: 'haircare', label: 'Hair Care', image: require('@/assets/services/cat-haircare.png') },
  { id: 'nailbar', label: 'Nail Bar', image: require('@/assets/services/cat-nailbar.png') },
  { id: 'face', label: 'Face', image: require('@/assets/services/cat-face.png') },
  { id: 'treatments', label: 'Treatments', image: require('@/assets/services/cat-treatments.png') },
  { id: 'massage', label: 'Massage', image: require('@/assets/services/cat-massage.png') },
  { id: 'haircolour', label: 'Hair Colour', image: require('@/assets/services/cat-haircolour.png') },
];

const genders = [
  { id: 'men', label: 'Men', icon: 'man' as const, color: '#60A5FA' },
  { id: 'women', label: 'Women', icon: 'woman' as const, color: '#F472B6' },
  { id: 'unisex', label: 'Unisex', icon: 'male-female' as const, color: '#C084FC' },
];

const globalServices = [
  {
    id: 'global',
    title: 'Global Hair Colour',
    note: 'Hair wash not included.',
    price: 'From ₹2499 + GST',
    cta: 'ADD',
  },
  {
    id: 'premium',
    title: 'Premium Global Hair Colour',
    note: 'Ammonia free premium shades.',
    price: 'From ₹3999 + GST',
    cta: 'ADD+',
    customisable: true,
  },
];

const collapsedSections = [
  { id: 'roots', label: 'Roots (1)' },
  { id: 'highlights', label: 'Highlights (2)' },
  { id: 'balayage', label: 'Balayage (1)' },
  { id: 'ombre', label: 'Ombre (1)' },
];

const colors = {
  bg: '#FFFAF5',
  white: '#FFFFFF',
  contentBg: '#FCFCFB',
  searchBg: '#F9FAFB',
  searchBorder: '#E5E7EB',
  circleBg: '#F3F4F6',
  catLabel: '#4B5563',
  catActive: '#111827',
  underline: '#0891B2',
  genderText: '#374151',
  genderActive: '#111827',
  accordionBorder: 'rgba(243, 244, 246, 0.5)',
  accordionTitle: '#111827',
  accordionCollapsed: '#374151',
  serviceIcon: '#F3B7C0',
  serviceTitle: '#222222',
  serviceNote: '#8E98A8',
  servicePrice: '#000000',
  addBorder: '#E7D7C9',
  gold: '#F89E07',
  divider: '#EAEAEA',
  heading: '#221A11',
  back: '#1F2937',
  placeholder: '#534433',
};

type Navigation = NativeStackNavigationProp<ClientStackParamList>;

export function SalonServicesScreen() {
  const navigation = useNavigation<Navigation>();
  const [activeCategory, setActiveCategory] = useState('haircolour');
  const [activeGender, setActiveGender] = useState('women');
  const [globalOpen, setGlobalOpen] = useState(true);

  const title = categories.find((category) => category.id === activeCategory)?.label ?? 'Services';

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons color={colors.back} name="arrow-back" size={24} />
        </Pressable>
        <Text style={styles.headerTitle}>{title}</Text>
        <View style={styles.headerSpacer} />
        <Pressable>
          <Ionicons color={colors.heading} name="cart-outline" size={24} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.filterSection}>
          <View style={styles.searchInput}>
            <Ionicons color={colors.serviceNote} name="search-outline" size={18} />
            <TextInput
              placeholder="Search for service..."
              placeholderTextColor={colors.placeholder}
              style={styles.searchText}
            />
          </View>

          <ScrollView
            contentContainerStyle={styles.categoryRow}
            horizontal
            showsHorizontalScrollIndicator={false}
          >
            {categories.map((category) => {
              const isActive = category.id === activeCategory;

              return (
                <Pressable
                  key={category.id}
                  onPress={() => setActiveCategory(category.id)}
                  style={styles.categoryItem}
                >
                  <View style={styles.categoryCircle}>
                    <Image source={category.image} style={styles.categoryImage} />
                  </View>
                  <Text style={[styles.categoryLabel, isActive && styles.categoryLabelActive]}>
                    {category.label}
                  </Text>
                  {isActive ? <View style={styles.categoryUnderline} /> : null}
                </Pressable>
              );
            })}
          </ScrollView>

          <View style={styles.genderRow}>
            {genders.map((gender) => {
              const isActive = gender.id === activeGender;

              return (
                <Pressable
                  key={gender.id}
                  onPress={() => setActiveGender(gender.id)}
                  style={[styles.genderButton, isActive && styles.genderButtonActive]}
                >
                  <Ionicons color={gender.color} name={gender.icon} size={15} />
                  <Text style={[styles.genderText, isActive && styles.genderTextActive]}>
                    {gender.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.contentArea}>
          <View style={styles.accordionExpanded}>
            <Pressable onPress={() => setGlobalOpen((open) => !open)} style={styles.accordionHeader}>
              <Text style={styles.accordionTitle}>Global (2)</Text>
              <Ionicons
                color={colors.accordionTitle}
                name={globalOpen ? 'chevron-up' : 'chevron-down'}
                size={20}
              />
            </Pressable>

            {globalOpen ? (
              <View style={styles.serviceList}>
                {globalServices.map((service, index) => (
                  <View key={service.id}>
                    {index > 0 ? <View style={styles.divider} /> : null}
                    <View style={styles.serviceItem}>
                      <View style={styles.serviceInfo}>
                        <View style={styles.serviceAccent} />
                        <Text style={styles.serviceTitle}>{service.title}</Text>
                        <Text style={styles.serviceNote}>{service.note}</Text>
                        <Text style={styles.servicePrice}>{service.price}</Text>
                      </View>

                      <View style={styles.serviceRight}>
                        <Pressable
                          onPress={() =>
                            navigation.navigate('SelectTime', { serviceName: service.title })
                          }
                          style={styles.addButton}
                        >
                          <Text style={styles.addButtonText}>{service.cta}</Text>
                        </Pressable>
                        {service.customisable ? (
                          <Text style={styles.customisable}>*customisable</Text>
                        ) : null}
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            ) : null}
          </View>

          <View style={styles.collapsedList}>
            {collapsedSections.map((section) => (
              <Pressable key={section.id} style={styles.accordionCollapsedItem}>
                <Text style={styles.accordionCollapsedTitle}>{section.label}</Text>
                <Ionicons color={colors.accordionCollapsed} name="chevron-down" size={20} />
              </Pressable>
            ))}
          </View>

          <Pressable style={styles.continueButton}>
            <Text style={styles.continueText}>Continue</Text>
          </Pressable>
        </View>
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
    alignItems: 'center',
    backgroundColor: colors.white,
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  backButton: {
    paddingRight: 8,
  },
  headerTitle: {
    color: colors.heading,
    fontFamily: 'Poppins_700Bold',
    fontSize: 20,
    letterSpacing: 0.5,
    marginLeft: 8,
  },
  headerSpacer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  filterSection: {
    backgroundColor: colors.white,
    gap: 16,
    paddingBottom: 24,
    paddingHorizontal: 16,
  },
  searchInput: {
    alignItems: 'center',
    backgroundColor: colors.searchBg,
    borderColor: colors.searchBorder,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    height: 50,
    paddingHorizontal: 12,
  },
  searchText: {
    color: colors.placeholder,
    flex: 1,
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
  },
  categoryRow: {
    gap: 24,
    paddingRight: 8,
  },
  categoryItem: {
    alignItems: 'center',
    gap: 8,
    paddingBottom: 12,
  },
  categoryCircle: {
    backgroundColor: colors.circleBg,
    borderRadius: 9999,
    height: 64,
    overflow: 'hidden',
    width: 64,
  },
  categoryImage: {
    height: '100%',
    width: '100%',
  },
  categoryLabel: {
    color: colors.catLabel,
    fontFamily: 'Montserrat_500Medium',
    fontSize: 12,
  },
  categoryLabelActive: {
    color: colors.catActive,
    fontFamily: 'Montserrat_600SemiBold',
  },
  categoryUnderline: {
    backgroundColor: colors.underline,
    borderRadius: 2,
    bottom: 0,
    height: 3,
    position: 'absolute',
    width: '70%',
  },
  genderRow: {
    flexDirection: 'row',
    gap: 12,
  },
  genderButton: {
    alignItems: 'center',
    borderColor: colors.searchBorder,
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    paddingVertical: 12,
  },
  genderButtonActive: {
    elevation: 1,
    shadowColor: 'rgba(0, 0, 0, 0.05)',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 2,
  },
  genderText: {
    color: colors.genderText,
    fontFamily: 'Montserrat_500Medium',
    fontSize: 14,
  },
  genderTextActive: {
    color: colors.genderActive,
  },
  contentArea: {
    backgroundColor: colors.contentBg,
    gap: 16,
    paddingBottom: 48,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  accordionExpanded: {
    backgroundColor: colors.white,
    borderColor: colors.accordionBorder,
    borderRadius: 16,
    borderWidth: 1,
    elevation: 1,
    shadowColor: 'rgba(0, 0, 0, 0.05)',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 2,
  },
  accordionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
  },
  accordionTitle: {
    color: colors.accordionTitle,
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 16,
    letterSpacing: -0.4,
  },
  serviceList: {
    gap: 16,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  serviceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 8,
  },
  serviceInfo: {
    flex: 1,
    paddingRight: 16,
  },
  serviceAccent: {
    backgroundColor: colors.serviceIcon,
    borderRadius: 2,
    height: 4,
    marginBottom: 6,
    width: 18,
  },
  serviceTitle: {
    color: colors.serviceTitle,
    fontFamily: 'Inter_500Medium',
    fontSize: 16,
    lineHeight: 22,
  },
  serviceNote: {
    color: colors.serviceNote,
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    lineHeight: 19.5,
    marginTop: 4,
  },
  servicePrice: {
    color: colors.servicePrice,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    marginTop: 6,
  },
  serviceRight: {
    alignItems: 'center',
    gap: 4,
  },
  addButton: {
    alignItems: 'center',
    borderColor: colors.addBorder,
    borderRadius: 20,
    borderWidth: 1,
    elevation: 1,
    paddingHorizontal: 24,
    paddingVertical: 8,
    shadowColor: 'rgba(0, 0, 0, 0.05)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
  },
  addButtonText: {
    color: colors.gold,
    fontFamily: 'Montserrat_700Bold',
    fontSize: 13,
  },
  customisable: {
    color: colors.serviceNote,
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    fontStyle: 'italic',
  },
  divider: {
    backgroundColor: colors.divider,
    height: 1,
    marginVertical: 16,
  },
  collapsedList: {
    gap: 12,
  },
  accordionCollapsedItem: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: colors.accordionBorder,
    borderRadius: 16,
    borderWidth: 1,
    elevation: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    shadowColor: 'rgba(0, 0, 0, 0.05)',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 2,
  },
  accordionCollapsedTitle: {
    color: colors.accordionCollapsed,
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 16,
    letterSpacing: -0.4,
  },
  continueButton: {
    alignItems: 'center',
    backgroundColor: colors.gold,
    borderRadius: 24,
    paddingVertical: 16,
  },
  continueText: {
    color: colors.white,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 18,
  },
});
