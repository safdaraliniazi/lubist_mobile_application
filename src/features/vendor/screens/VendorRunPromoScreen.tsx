import { useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { useActiveVendorPromotion, useApplyVendorPromotion } from '@/services/api/hooks/useVendorAPI';
import { Screen } from '@/shared/components/Screen';
import { SurfaceCard } from '@/shared/components/SurfaceCard';
import { VendorStackParamList } from '@/navigation/navigation.types';
import { palette } from '@/theme/palette';
import { typography } from '@/theme/typography';

type Navigation = NativeStackNavigationProp<VendorStackParamList>;

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export function VendorRunPromoScreen() {
  const navigation = useNavigation<Navigation>();
  const { data: activePromo, isLoading } = useActiveVendorPromotion();
  const applyPromo = useApplyVendorPromotion();

  const [title, setTitle] = useState('');
  const [discountType, setDiscountType] = useState<'flat_amount' | 'percentage'>('percentage');
  const [discountValue, setDiscountValue] = useState('');
  const [minBookingAmount, setMinBookingAmount] = useState('');
  const [maxDiscountLimit, setMaxDiscountLimit] = useState('');
  const [startDate, setStartDate] = useState(todayIso());
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    if (!activePromo) return;
    setTitle(activePromo.title);
    setDiscountType(activePromo.discount_type);
    setDiscountValue(String(activePromo.discount_value));
    setMinBookingAmount(activePromo.min_booking_amount != null ? String(activePromo.min_booking_amount) : '');
    setMaxDiscountLimit(activePromo.max_discount_limit != null ? String(activePromo.max_discount_limit) : '');
    setStartDate(activePromo.start_date);
    setEndDate(activePromo.end_date ?? '');
  }, [activePromo]);

  function validate(): string | null {
    if (!title.trim()) return 'Offer title is required.';
    const value = Number(discountValue);
    if (!discountValue.trim() || Number.isNaN(value) || value <= 0) return 'Enter a valid discount value.';
    if (discountType === 'percentage' && value > 100) return 'Percentage discount cannot exceed 100.';
    if (!startDate.trim()) return 'Start date is required (YYYY-MM-DD).';
    if (endDate.trim()) {
      if (endDate < startDate) return 'End date must be on or after start date.';
      if (endDate < todayIso()) return 'End date cannot be in the past.';
    }
    const min = minBookingAmount.trim() ? Number(minBookingAmount) : undefined;
    if (min !== undefined && (Number.isNaN(min) || min < 0)) return 'Min. booking amount must be 0 or more.';
    const max = maxDiscountLimit.trim() ? Number(maxDiscountLimit) : undefined;
    if (max !== undefined && (Number.isNaN(max) || max < 0)) return 'Max. limit must be 0 or more.';
    if (min !== undefined && max !== undefined && max < min) {
      return 'Max discount limit should be greater than or equal to minimum booking amount.';
    }
    return null;
  }

  async function handleSubmit() {
    const error = validate();
    if (error) {
      Alert.alert('Invalid promotion', error);
      return;
    }

    try {
      const result = await applyPromo.mutateAsync({
        title: title.trim(),
        discount_type: discountType,
        discount_value: Number(discountValue),
        min_booking_amount: minBookingAmount.trim() ? Number(minBookingAmount) : null,
        max_discount_limit: maxDiscountLimit.trim() ? Number(maxDiscountLimit) : null,
        start_date: startDate.trim(),
        end_date: endDate.trim() || null,
      });

      let message = 'Promotion saved successfully!';
      if (result.status === 'scheduled') {
        message = `Promo saved. Discounts apply automatically from ${result.start_date}.`;
      } else if (result.services_updated > 0) {
        message = `Discount applied to ${result.services_updated} service(s)!`;
      }
      Alert.alert('Success', message);
      navigation.navigate('Tabs', { screen: 'Dashboard' } as never);
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to save promotion');
    }
  }

  if (isLoading) {
    return (
      <Screen>
        <ActivityIndicator color={palette.primary} style={styles.loader} />
      </Screen>
    );
  }

  return (
    <Screen scrollable>
      <Text style={styles.title}>Run Promo</Text>
      <Text style={styles.subtitle}>Apply a flat discount management offer across all your services.</Text>

      {activePromo ? (
        <SurfaceCard>
          <Text style={styles.bannerTitle}>
            Current promo: {activePromo.title} ({activePromo.status})
          </Text>
          <Text style={styles.bannerMeta}>
            {activePromo.start_date} {activePromo.end_date ? `→ ${activePromo.end_date}` : '(no end date)'}
          </Text>
          <Text style={styles.bannerMeta}>Applies to all services</Text>
        </SurfaceCard>
      ) : null}

      <SurfaceCard>
        <Field label="Offer Title">
          <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="e.g. Monsoon Special" placeholderTextColor={palette.muted} />
        </Field>

        <Field label="Discount Type">
          <View style={styles.toggleRow}>
            {(['flat_amount', 'percentage'] as const).map((type) => (
              <Pressable
                key={type}
                style={[styles.toggleButton, discountType === type && styles.toggleButtonActive]}
                onPress={() => setDiscountType(type)}
              >
                <Text style={[styles.toggleLabel, discountType === type && styles.toggleLabelActive]}>
                  {type === 'flat_amount' ? '₹ Flat Amount' : '% Percentage'}
                </Text>
              </Pressable>
            ))}
          </View>
        </Field>

        <Field label={discountType === 'percentage' ? 'Discount Value (%)' : 'Discount Value (₹)'}>
          <TextInput style={styles.input} value={discountValue} onChangeText={setDiscountValue} keyboardType="decimal-pad" />
        </Field>

        <Field label="Min. Booking Amount (optional)">
          <TextInput style={styles.input} value={minBookingAmount} onChangeText={setMinBookingAmount} keyboardType="decimal-pad" />
        </Field>

        <Field label="Max. Limit (optional)">
          <TextInput style={styles.input} value={maxDiscountLimit} onChangeText={setMaxDiscountLimit} keyboardType="decimal-pad" />
        </Field>

        <Field label="Start Date (YYYY-MM-DD)">
          <TextInput style={styles.input} value={startDate} onChangeText={setStartDate} placeholder="2026-01-01" placeholderTextColor={palette.muted} />
        </Field>

        <Field label="End Date (optional, YYYY-MM-DD)">
          <TextInput style={styles.input} value={endDate} onChangeText={setEndDate} placeholder="2026-01-31" placeholderTextColor={palette.muted} />
        </Field>
      </SurfaceCard>

      <Pressable style={styles.submitButton} disabled={applyPromo.isPending} onPress={handleSubmit}>
        <Text style={styles.submitButtonLabel}>{applyPromo.isPending ? 'Saving…' : 'Save Promotion'}</Text>
      </Pressable>
    </Screen>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  loader: { marginTop: 40 },
  title: {
    color: palette.text,
    fontSize: 24,
    fontWeight: typography.weight.bold,
  },
  subtitle: {
    color: palette.muted,
    fontSize: 14,
    marginBottom: 16,
    marginTop: 4,
  },
  bannerTitle: {
    color: palette.text,
    fontSize: 14,
    fontWeight: typography.weight.semibold,
  },
  bannerMeta: {
    color: palette.muted,
    fontSize: 13,
    marginTop: 4,
  },
  field: {
    marginBottom: 14,
  },
  fieldLabel: {
    color: palette.muted,
    fontSize: 12,
    marginBottom: 6,
  },
  input: {
    backgroundColor: palette.background,
    borderColor: palette.border,
    borderRadius: 10,
    borderWidth: 1,
    color: palette.text,
    fontSize: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  toggleRow: {
    flexDirection: 'row',
    gap: 8,
  },
  toggleButton: {
    borderColor: palette.border,
    borderRadius: 12,
    borderWidth: 1,
    flex: 1,
    paddingVertical: 10,
  },
  toggleButtonActive: {
    backgroundColor: palette.primary,
    borderColor: palette.primary,
  },
  toggleLabel: {
    color: palette.text,
    fontSize: 13,
    fontWeight: typography.weight.medium,
    textAlign: 'center',
  },
  toggleLabelActive: {
    color: palette.surface,
  },
  submitButton: {
    alignItems: 'center',
    backgroundColor: palette.primary,
    borderRadius: 16,
    marginTop: 8,
    marginBottom: 24,
    paddingVertical: 14,
  },
  submitButtonLabel: {
    color: palette.surface,
    fontSize: 15,
    fontWeight: typography.weight.semibold,
  },
});
