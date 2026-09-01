import { useEffect, useMemo, useState } from 'react';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';

import {
  ServiceCategoryNode,
  ServiceSubcategoryNode,
  useServiceCategories,
  useUpdateVendorService,
  useVendorServices,
  VendorServiceUpdate,
} from '@/services/api/hooks/useVendorAPI';
import { pickImage, uploadSalonImage } from '@/services/upload/uploadService';
import { Screen } from '@/shared/components/Screen';
import { SurfaceCard } from '@/shared/components/SurfaceCard';
import { VendorStackParamList } from '@/navigation/navigation.types';
import { palette } from '@/theme/palette';
import { typography } from '@/theme/typography';

type Navigation = NativeStackNavigationProp<VendorStackParamList>;
type Route = RouteProp<VendorStackParamList, 'ServiceConfigure'>;

const DURATION_OPTIONS = [15, 30, 45, 60, 75, 90, 120, 150, 180];
const GENDER_OPTIONS: Array<{ value: 'male' | 'female' | 'both'; label: string }> = [
  { value: 'male', label: 'Men' },
  { value: 'female', label: 'Women' },
  { value: 'both', label: 'Unisex' },
];

export function VendorServiceConfigureScreen() {
  const navigation = useNavigation<Navigation>();
  const route = useRoute<Route>();

  const { data: services, isLoading: servicesLoading } = useVendorServices();
  const { data: categories } = useServiceCategories();
  const updateService = useUpdateVendorService();

  const service = useMemo(
    () => services?.find((s) => s.id === route.params.serviceId),
    [services, route.params.serviceId],
  );

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [discountPercentage, setDiscountPercentage] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [genderCategory, setGenderCategory] = useState<'male' | 'female' | 'both'>('both');
  const [categoryId, setCategoryId] = useState<string | undefined>();
  const [subcategoryId, setSubcategoryId] = useState<string | undefined>();
  const [isActive, setIsActive] = useState(true);
  const [imageUrl, setImageUrl] = useState<string | undefined>();
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!service) return;
    setName(service.name);
    setDescription(service.description ?? '');
    setPrice(String(service.price));
    setDiscountPercentage(service.discount_percentage != null ? String(service.discount_percentage) : '');
    setDurationMinutes(service.duration_minutes);
    setGenderCategory(service.gender_category ?? 'both');
    setCategoryId(service.category_id ?? undefined);
    setSubcategoryId(service.subcategory_id ?? undefined);
    setIsActive(service.is_active);
    setImageUrl(service.image_url ?? undefined);
  }, [service]);

  if (servicesLoading && !services) {
    return (
      <Screen>
        <ActivityIndicator color={palette.primary} style={styles.loader} />
      </Screen>
    );
  }

  if (!service) {
    return (
      <Screen>
        <Text style={styles.emptyText}>Service not found.</Text>
      </Screen>
    );
  }

  const selectedCategory = categories?.find((c) => c.id === categoryId);
  const subcategories = selectedCategory?.subcategories ?? [];

  async function handleUploadImage() {
    try {
      const asset = await pickImage();
      if (!asset) return;
      setUploading(true);
      const result = await uploadSalonImage(asset, 'gallery');
      setImageUrl(result.url);
    } catch (err: any) {
      Alert.alert('Upload failed', err?.message || 'Could not upload image');
    } finally {
      setUploading(false);
    }
  }

  async function handleSave() {
    const priceValue = Number(price);
    if (!name.trim() || name.trim().length < 2) {
      Alert.alert('Invalid name', 'Service name must be at least 2 characters.');
      return;
    }
    if (Number.isNaN(priceValue) || priceValue < 0) {
      Alert.alert('Invalid price', 'Enter a valid price (0 or more).');
      return;
    }
    const discountValue = discountPercentage.trim() ? Number(discountPercentage) : null;
    if (discountValue != null && (Number.isNaN(discountValue) || discountValue < 0 || discountValue > 100)) {
      Alert.alert('Invalid discount', 'Discount must be between 0 and 100.');
      return;
    }
    if (discountValue && priceValue <= 0) {
      Alert.alert('Invalid discount', 'Discount can only be applied to services with a price greater than 0.');
      return;
    }

    const update: VendorServiceUpdate = {
      name: name.trim(),
      description: description.trim() || null,
      duration_minutes: durationMinutes,
      price: priceValue,
      discount_percentage: discountValue,
      gender_category: genderCategory,
      category_id: categoryId ?? null,
      subcategory_id: subcategoryId ?? null,
      is_active: isActive,
      image_url: imageUrl ?? null,
    };

    try {
      await updateService.mutateAsync({ serviceId: service!.id, update });
      navigation.goBack();
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to save service');
    }
  }

  return (
    <Screen scrollable>
      <Text style={styles.title}>Configure Service</Text>

      <SurfaceCard>
        <Field label="Service Name">
          <TextInput style={styles.input} value={name} onChangeText={setName} />
        </Field>

        <Field label="Category">
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {(categories ?? []).map((cat: ServiceCategoryNode) => (
              <Pressable
                key={cat.id}
                style={[styles.chip, categoryId === cat.id && styles.chipActive]}
                onPress={() => {
                  setCategoryId(cat.id);
                  setSubcategoryId(undefined);
                }}
              >
                <Text style={[styles.chipLabel, categoryId === cat.id && styles.chipLabelActive]}>{cat.name}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </Field>

        {subcategories.length > 0 ? (
          <Field label="Subcategory">
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {subcategories.map((sub: ServiceSubcategoryNode) => (
                <Pressable
                  key={sub.id}
                  style={[styles.chip, subcategoryId === sub.id && styles.chipActive]}
                  onPress={() => setSubcategoryId(sub.id)}
                >
                  <Text style={[styles.chipLabel, subcategoryId === sub.id && styles.chipLabelActive]}>
                    {sub.name}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </Field>
        ) : null}

        <Field label="Duration">
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {DURATION_OPTIONS.map((minutes) => (
              <Pressable
                key={minutes}
                style={[styles.chip, durationMinutes === minutes && styles.chipActive]}
                onPress={() => setDurationMinutes(minutes)}
              >
                <Text style={[styles.chipLabel, durationMinutes === minutes && styles.chipLabelActive]}>
                  {minutes} min
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </Field>

        <Field label="Gender">
          <View style={styles.genderRow}>
            {GENDER_OPTIONS.map((opt) => (
              <Pressable
                key={opt.value}
                style={[styles.genderButton, genderCategory === opt.value && styles.chipActive]}
                onPress={() => setGenderCategory(opt.value)}
              >
                <Text style={[styles.chipLabel, genderCategory === opt.value && styles.chipLabelActive]}>
                  {opt.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </Field>

        <Field label="Description">
          <TextInput
            style={[styles.input, styles.multiline]}
            value={description}
            onChangeText={(v) => setDescription(v.slice(0, 250))}
            multiline
          />
          <Text style={styles.charCount}>{description.length}/250</Text>
        </Field>

        <Field label="Base Price (₹)">
          <TextInput style={styles.input} value={price} onChangeText={setPrice} keyboardType="decimal-pad" />
        </Field>

        <Field label="Discount % (optional)">
          <TextInput
            style={styles.input}
            value={discountPercentage}
            onChangeText={setDiscountPercentage}
            keyboardType="decimal-pad"
          />
        </Field>

        <View style={styles.activeRow}>
          <Text style={styles.fieldLabel}>Active</Text>
          <Switch value={isActive} onValueChange={setIsActive} trackColor={{ true: palette.primary }} />
        </View>

        <Field label="Image">
          {imageUrl ? <Text style={styles.lineMuted} numberOfLines={1}>{imageUrl}</Text> : null}
          <Pressable style={styles.uploadButton} disabled={uploading} onPress={handleUploadImage}>
            <Text style={styles.uploadButtonLabel}>{uploading ? 'Uploading…' : 'Upload Image'}</Text>
          </Pressable>
        </Field>
      </SurfaceCard>

      <View style={styles.footer}>
        <Pressable style={styles.cancelButton} onPress={() => navigation.goBack()}>
          <Text style={styles.cancelButtonLabel}>Cancel</Text>
        </Pressable>
        <Pressable style={styles.saveButton} disabled={updateService.isPending} onPress={handleSave}>
          <Text style={styles.saveButtonLabel}>{updateService.isPending ? 'Saving…' : 'Save Service'}</Text>
        </Pressable>
      </View>
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
  emptyText: { color: palette.muted, fontSize: 14 },
  title: {
    color: palette.text,
    fontSize: 22,
    fontWeight: typography.weight.bold,
    marginBottom: 16,
  },
  field: {
    marginBottom: 16,
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
  multiline: {
    minHeight: 70,
    textAlignVertical: 'top',
  },
  charCount: {
    color: palette.muted,
    fontSize: 11,
    marginTop: 4,
    textAlign: 'right',
  },
  chip: {
    backgroundColor: palette.background,
    borderColor: palette.border,
    borderRadius: 999,
    borderWidth: 1,
    marginRight: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  chipActive: {
    backgroundColor: palette.primary,
    borderColor: palette.primary,
  },
  chipLabel: {
    color: palette.text,
    fontSize: 13,
    fontWeight: typography.weight.medium,
  },
  chipLabelActive: {
    color: palette.surface,
  },
  genderRow: {
    flexDirection: 'row',
    gap: 8,
  },
  genderButton: {
    backgroundColor: palette.background,
    borderColor: palette.border,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  activeRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  lineMuted: {
    color: palette.muted,
    fontSize: 12,
    marginBottom: 6,
  },
  uploadButton: {
    alignSelf: 'flex-start',
    borderColor: palette.primary,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  uploadButtonLabel: {
    color: palette.primary,
    fontSize: 13,
    fontWeight: typography.weight.semibold,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
    marginBottom: 24,
  },
  cancelButton: {
    alignItems: 'center',
    borderColor: palette.border,
    borderRadius: 16,
    borderWidth: 1,
    flex: 1,
    paddingVertical: 14,
  },
  cancelButtonLabel: {
    color: palette.text,
    fontSize: 15,
    fontWeight: typography.weight.semibold,
  },
  saveButton: {
    alignItems: 'center',
    backgroundColor: palette.primary,
    borderRadius: 16,
    flex: 2,
    paddingVertical: 14,
  },
  saveButtonLabel: {
    color: palette.surface,
    fontSize: 15,
    fontWeight: typography.weight.semibold,
  },
});
