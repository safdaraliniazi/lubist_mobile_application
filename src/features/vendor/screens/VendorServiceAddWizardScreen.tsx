import { useMemo, useRef, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import {
  ServiceCategoryNode,
  useCreateVendorService,
  useDeleteVendorService,
  useServiceCategories,
  useUpdateVendorService,
  VendorServiceCreate,
} from '@/services/api/hooks/useVendorAPI';
import { Screen } from '@/shared/components/Screen';
import { SurfaceCard } from '@/shared/components/SurfaceCard';
import { VendorStackParamList } from '@/navigation/navigation.types';
import { palette } from '@/theme/palette';
import { typography } from '@/theme/typography';

type Navigation = NativeStackNavigationProp<VendorStackParamList>;

const DURATION_OPTIONS = [15, 30, 45, 60, 75, 90, 120, 150, 180];
const GENDER_OPTIONS: Array<{ value: 'male' | 'female' | 'both'; label: string }> = [
  { value: 'male', label: 'Men' },
  { value: 'female', label: 'Women' },
  { value: 'both', label: 'Unisex' },
];

interface WizardRow {
  localId: string;
  contextId: number;
  name: string;
  price: string;
  status: 'saving' | 'saved' | 'error';
  serviceId?: string;
  errorMessage?: string;
}

export function VendorServiceAddWizardScreen() {
  const navigation = useNavigation<Navigation>();
  const { data: categories } = useServiceCategories();
  const createService = useCreateVendorService();
  const updateService = useUpdateVendorService();
  const deleteService = useDeleteVendorService();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Step 1
  const [genderCategory, setGenderCategory] = useState<'male' | 'female' | 'both' | undefined>();

  // Step 2
  const [categoryId, setCategoryId] = useState<string | undefined>();

  // Step 3
  const [subcategoryId, setSubcategoryId] = useState<string | undefined>();
  const [subcategoryName, setSubcategoryName] = useState('');
  const [subSubcategoryId, setSubSubcategoryId] = useState<string | undefined>();
  const [subSubcategoryName, setSubSubcategoryName] = useState('');

  // Batch context
  const [contextId, setContextId] = useState(0);
  const [contextLabel, setContextLabel] = useState('');
  const resolvedSubcategoryRef = useRef<Map<number, string>>(new Map());
  const nextContextId = useRef(1);
  const lastTaxonomyKeyRef = useRef<string | undefined>(undefined);

  // Step 4 shared defaults
  const [batchDuration, setBatchDuration] = useState(30);
  const [batchGender, setBatchGender] = useState<'male' | 'female' | 'both'>('both');
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [batchDescription, setBatchDescription] = useState('');
  const [batchDiscount, setBatchDiscount] = useState('');

  const [rowName, setRowName] = useState('');
  const [rowPrice, setRowPrice] = useState('');
  const [rows, setRows] = useState<WizardRow[]>([]);
  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editPrice, setEditPrice] = useState('');

  const saveQueueRef = useRef<Promise<void>>(Promise.resolve());

  const selectedCategory = categories?.find((c) => c.id === categoryId);
  const currentContextRows = rows.filter((r) => r.contextId === contextId);
  const savedCount = rows.filter((r) => r.status === 'saved').length;
  const hasErrors = rows.some((r) => r.status === 'error');

  function handleBack() {
    if (step === 1) {
      navigation.goBack();
      return;
    }
    setStep((s) => (s - 1) as 1 | 2 | 3);
  }

  function handleStep3Continue() {
    const label = [
      selectedCategory?.name,
      subcategoryId
        ? selectedCategory?.subcategories.find((s) => s.id === subcategoryId)?.name
        : subcategoryName.trim(),
      subSubcategoryId
        ? selectedCategory?.subcategories
            .find((s) => s.id === subcategoryId)
            ?.subcategories?.find((s3) => s3.id === subSubcategoryId)?.name
        : subSubcategoryName.trim(),
    ]
      .filter(Boolean)
      .join(' › ');

    const taxonomyKey = `${categoryId}|${subcategoryId ?? subcategoryName.trim()}|${subSubcategoryId ?? subSubcategoryName.trim()}`;
    if (taxonomyKey !== lastTaxonomyKeyRef.current) {
      const newContextId = nextContextId.current++;
      setContextId(newContextId);
      lastTaxonomyKeyRef.current = taxonomyKey;
    }
    setContextLabel(label);
    setBatchGender(genderCategory ?? 'both');
    setStep(4);
  }

  function buildRowPayload(name: string, price: number): VendorServiceCreate {
    const resolved = resolvedSubcategoryRef.current.get(contextId);
    const base: VendorServiceCreate = {
      name,
      description: batchDescription.trim() || undefined,
      price,
      discount_percentage: batchDiscount.trim() ? Number(batchDiscount) : undefined,
      duration_minutes: batchDuration,
      gender_category: batchGender,
      is_active: true,
      category_id: categoryId,
    };
    if (resolved) {
      base.subcategory_id = resolved;
      return base;
    }
    if (subcategoryId) base.subcategory_id = subcategoryId;
    else if (subcategoryName.trim()) base.subcategory_name = subcategoryName.trim();
    if (subSubcategoryId) base.sub_subcategory_id = subSubcategoryId;
    else if (subSubcategoryName.trim()) base.sub_subcategory_name = subSubcategoryName.trim();
    return base;
  }

  function enqueueSave(row: WizardRow, priceValue: number) {
    saveQueueRef.current = saveQueueRef.current.then(async () => {
      try {
        const payload = buildRowPayload(row.name, priceValue);
        const created = await createService.mutateAsync(payload);
        if (!resolvedSubcategoryRef.current.has(row.contextId) && created.subcategory_id) {
          resolvedSubcategoryRef.current.set(row.contextId, created.subcategory_id);
        }
        setRows((prev) =>
          prev.map((r) => (r.localId === row.localId ? { ...r, status: 'saved', serviceId: created.id } : r)),
        );
      } catch (err: any) {
        setRows((prev) =>
          prev.map((r) =>
            r.localId === row.localId
              ? { ...r, status: 'error', errorMessage: err?.message || 'Failed to save' }
              : r,
          ),
        );
      }
    });
  }

  function handleAddRow() {
    const trimmedName = rowName.trim();
    if (trimmedName.length < 2 || trimmedName.length > 255) {
      Alert.alert('Invalid name', 'Service name must be 2-255 characters.');
      return;
    }
    const priceValue = Number(rowPrice);
    if (rowPrice.trim() === '' || Number.isNaN(priceValue) || priceValue < 0) {
      Alert.alert('Invalid price', 'Enter a valid price (0 or more).');
      return;
    }
    if (batchDiscount.trim()) {
      const discount = Number(batchDiscount);
      if (Number.isNaN(discount) || discount < 0 || discount > 100) {
        Alert.alert('Invalid discount', 'Discount must be between 0 and 100.');
        return;
      }
      if (discount > 0 && priceValue <= 0) {
        Alert.alert('Invalid discount', 'Discount can only be applied when price is greater than 0.');
        return;
      }
    }
    const duplicate = currentContextRows.some(
      (r) => r.name.toLowerCase() === trimmedName.toLowerCase() && r.status !== 'error',
    );
    if (duplicate) {
      Alert.alert('Duplicate service', `"${trimmedName}" was already added in this batch.`);
      return;
    }

    const localId = `${Date.now()}-${Math.random()}`;
    const newRow: WizardRow = { localId, contextId, name: trimmedName, price: rowPrice, status: 'saving' };
    setRows((prev) => [newRow, ...prev]);
    enqueueSave(newRow, priceValue);
    setRowName('');
    setRowPrice('');
  }

  function handleRetry(row: WizardRow) {
    setRows((prev) => prev.map((r) => (r.localId === row.localId ? { ...r, status: 'saving' } : r)));
    enqueueSave(row, Number(row.price));
  }

  function startEdit(row: WizardRow) {
    setEditingRowId(row.localId);
    setEditName(row.name);
    setEditPrice(row.price);
  }

  async function saveEdit(row: WizardRow) {
    if (!row.serviceId) {
      setRows((prev) =>
        prev.map((r) => (r.localId === row.localId ? { ...r, name: editName.trim(), price: editPrice } : r)),
      );
      setEditingRowId(null);
      return;
    }
    try {
      await updateService.mutateAsync({
        serviceId: row.serviceId,
        update: { name: editName.trim(), price: Number(editPrice) },
      });
      setRows((prev) =>
        prev.map((r) => (r.localId === row.localId ? { ...r, name: editName.trim(), price: editPrice } : r)),
      );
      setEditingRowId(null);
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to update');
    }
  }

  async function handleDeleteRow(row: WizardRow) {
    if (row.serviceId) {
      try {
        await deleteService.mutateAsync(row.serviceId);
      } catch (err: any) {
        Alert.alert('Error', err?.message || 'Failed to delete');
        return;
      }
    }
    setRows((prev) => prev.filter((r) => r.localId !== row.localId));
  }

  function handleDone() {
    if (hasErrors) {
      const errorCount = rows.filter((r) => r.status === 'error').length;
      Alert.alert(
        'Unsaved services',
        `${errorCount} service(s) failed to save and will be lost. Leave anyway?`,
        [
          { text: 'Stay', style: 'cancel' },
          { text: 'Leave', style: 'destructive', onPress: () => navigation.goBack() },
        ],
      );
      return;
    }
    navigation.goBack();
  }

  return (
    <Screen scrollable>
      <View style={styles.headerRow}>
        <Pressable onPress={handleBack}>
          <Text style={styles.backLabel}>← Back</Text>
        </Pressable>
        <Text style={styles.stepLabel}>Step {step} of 4</Text>
      </View>

      {step === 1 ? (
        <View>
          <Text style={styles.title}>Who is this for?</Text>
          <View style={styles.optionList}>
            {GENDER_OPTIONS.map((opt) => (
              <Pressable
                key={opt.value}
                style={[styles.optionCard, genderCategory === opt.value && styles.optionCardActive]}
                onPress={() => setGenderCategory(opt.value)}
              >
                <Text style={[styles.optionLabel, genderCategory === opt.value && styles.optionLabelActive]}>
                  {opt.label}
                </Text>
              </Pressable>
            ))}
          </View>
          <Pressable
            style={[styles.continueButton, !genderCategory && styles.continueButtonDisabled]}
            disabled={!genderCategory}
            onPress={() => setStep(2)}
          >
            <Text style={styles.continueButtonLabel}>Continue</Text>
          </Pressable>
        </View>
      ) : null}

      {step === 2 ? (
        <View>
          <Text style={styles.title}>Choose a category</Text>
          <View style={styles.optionList}>
            {(categories ?? []).map((cat: ServiceCategoryNode) => (
              <Pressable
                key={cat.id}
                style={[styles.optionCard, categoryId === cat.id && styles.optionCardActive]}
                onPress={() => {
                  setCategoryId(cat.id);
                  setSubcategoryId(undefined);
                  setSubcategoryName('');
                  setSubSubcategoryId(undefined);
                  setSubSubcategoryName('');
                }}
              >
                <Text style={[styles.optionLabel, categoryId === cat.id && styles.optionLabelActive]}>
                  {cat.name}
                </Text>
                {cat.description ? (
                  <Text style={[styles.optionDescription, categoryId === cat.id && styles.optionLabelActive]}>
                    {cat.description}
                  </Text>
                ) : null}
              </Pressable>
            ))}
          </View>
          <Pressable
            style={[styles.continueButton, !categoryId && styles.continueButtonDisabled]}
            disabled={!categoryId}
            onPress={() => setStep(3)}
          >
            <Text style={styles.continueButtonLabel}>Continue</Text>
          </Pressable>
        </View>
      ) : null}

      {step === 3 ? (
        <View>
          <Text style={styles.title}>Choose a subcategory</Text>
          <View style={styles.optionList}>
            {(selectedCategory?.subcategories ?? []).map((sub) => (
              <Pressable
                key={sub.id}
                style={[styles.optionCard, subcategoryId === sub.id && styles.optionCardActive]}
                onPress={() => {
                  setSubcategoryId(sub.id);
                  setSubcategoryName('');
                  setSubSubcategoryId(undefined);
                  setSubSubcategoryName('');
                }}
              >
                <Text style={[styles.optionLabel, subcategoryId === sub.id && styles.optionLabelActive]}>
                  {sub.name}
                </Text>
              </Pressable>
            ))}
          </View>
          <TextInput
            style={styles.input}
            placeholder="Or add a new subcategory…"
            placeholderTextColor={palette.muted}
            value={subcategoryName}
            onChangeText={(v) => {
              setSubcategoryName(v);
              if (v) {
                setSubcategoryId(undefined);
                setSubSubcategoryId(undefined);
                setSubSubcategoryName('');
              }
            }}
          />

          {subcategoryId || subcategoryName.trim() ? (
            <View style={styles.subSubSection}>
              <Text style={styles.subLabel}>Sub-type (optional)</Text>
              {subcategoryId ? (
                <View style={styles.chipRow}>
                  {(selectedCategory?.subcategories.find((s) => s.id === subcategoryId)?.subcategories ?? []).map(
                    (sub3) => (
                      <Pressable
                        key={sub3.id}
                        style={[styles.chip, subSubcategoryId === sub3.id && styles.chipActive]}
                        onPress={() => {
                          setSubSubcategoryId(sub3.id);
                          setSubSubcategoryName('');
                        }}
                      >
                        <Text style={[styles.chipLabel, subSubcategoryId === sub3.id && styles.chipLabelActive]}>
                          {sub3.name}
                        </Text>
                      </Pressable>
                    ),
                  )}
                </View>
              ) : null}
              <TextInput
                style={styles.input}
                placeholder="Or add a new sub-type…"
                placeholderTextColor={palette.muted}
                value={subSubcategoryName}
                onChangeText={(v) => {
                  setSubSubcategoryName(v);
                  if (v) setSubSubcategoryId(undefined);
                }}
              />
            </View>
          ) : null}

          <Pressable
            style={[styles.continueButton, !(subcategoryId || subcategoryName.trim()) && styles.continueButtonDisabled]}
            disabled={!(subcategoryId || subcategoryName.trim())}
            onPress={handleStep3Continue}
          >
            <Text style={styles.continueButtonLabel}>Continue</Text>
          </Pressable>
        </View>
      ) : null}

      {step === 4 ? (
        <View>
          <Text style={styles.title}>{contextLabel || 'Add services'}</Text>

          <SurfaceCard>
            <Text style={styles.subLabel}>Applies to every service added below</Text>
            <View style={styles.chipRow}>
              {DURATION_OPTIONS.map((minutes) => (
                <Pressable
                  key={minutes}
                  style={[styles.chip, batchDuration === minutes && styles.chipActive]}
                  onPress={() => setBatchDuration(minutes)}
                >
                  <Text style={[styles.chipLabel, batchDuration === minutes && styles.chipLabelActive]}>
                    {minutes} min
                  </Text>
                </Pressable>
              ))}
            </View>
            <View style={[styles.chipRow, styles.spaced]}>
              {GENDER_OPTIONS.map((opt) => (
                <Pressable
                  key={opt.value}
                  style={[styles.chip, batchGender === opt.value && styles.chipActive]}
                  onPress={() => setBatchGender(opt.value)}
                >
                  <Text style={[styles.chipLabel, batchGender === opt.value && styles.chipLabelActive]}>
                    {opt.label}
                  </Text>
                </Pressable>
              ))}
            </View>
            <Pressable onPress={() => setShowMoreOptions((v) => !v)}>
              <Text style={styles.moreOptionsLabel}>{showMoreOptions ? 'Hide options' : 'More options'}</Text>
            </Pressable>
            {showMoreOptions ? (
              <View style={styles.spaced}>
                <TextInput
                  style={[styles.input, styles.multiline]}
                  placeholder="Shared description (optional)"
                  placeholderTextColor={palette.muted}
                  value={batchDescription}
                  onChangeText={(v) => setBatchDescription(v.slice(0, 250))}
                  multiline
                />
                <TextInput
                  style={[styles.input, styles.spaced]}
                  placeholder="Shared discount % (optional)"
                  placeholderTextColor={palette.muted}
                  value={batchDiscount}
                  onChangeText={setBatchDiscount}
                  keyboardType="decimal-pad"
                />
              </View>
            ) : null}
          </SurfaceCard>

          <SurfaceCard>
            <View style={styles.entryRow}>
              <TextInput
                style={[styles.input, styles.entryName]}
                placeholder="Service name"
                placeholderTextColor={palette.muted}
                value={rowName}
                onChangeText={setRowName}
                onSubmitEditing={handleAddRow}
              />
              <TextInput
                style={[styles.input, styles.entryPrice]}
                placeholder="Price"
                placeholderTextColor={palette.muted}
                value={rowPrice}
                onChangeText={setRowPrice}
                keyboardType="decimal-pad"
                onSubmitEditing={handleAddRow}
              />
              <Pressable style={styles.addRowButton} onPress={handleAddRow}>
                <Text style={styles.addRowButtonLabel}>Add</Text>
              </Pressable>
            </View>
          </SurfaceCard>

          {rows.length > 0 ? (
            <View style={styles.rowList}>
              {rows.map((row) => (
                <SurfaceCard key={row.localId}>
                  {editingRowId === row.localId ? (
                    <View style={styles.entryRow}>
                      <TextInput style={[styles.input, styles.entryName]} value={editName} onChangeText={setEditName} />
                      <TextInput
                        style={[styles.input, styles.entryPrice]}
                        value={editPrice}
                        onChangeText={setEditPrice}
                        keyboardType="decimal-pad"
                      />
                      <Pressable style={styles.addRowButton} onPress={() => saveEdit(row)}>
                        <Text style={styles.addRowButtonLabel}>Save</Text>
                      </Pressable>
                    </View>
                  ) : (
                    <View style={styles.rowItem}>
                      <View style={styles.rowInfo}>
                        <Text style={styles.rowName}>{row.name}</Text>
                        <Text style={styles.rowPrice}>₹{row.price}</Text>
                        {row.status === 'error' ? (
                          <Text style={styles.rowError}>{row.errorMessage}</Text>
                        ) : null}
                      </View>
                      {row.status === 'saving' ? (
                        <ActivityIndicator color={palette.primary} />
                      ) : row.status === 'saved' ? (
                        <View style={styles.rowActions}>
                          <Text style={styles.savedCheck}>✓</Text>
                          <Pressable onPress={() => startEdit(row)}>
                            <Text style={styles.editLink}>Edit</Text>
                          </Pressable>
                          <Pressable onPress={() => handleDeleteRow(row)}>
                            <Text style={styles.deleteLink}>Delete</Text>
                          </Pressable>
                        </View>
                      ) : (
                        <View style={styles.rowActions}>
                          <Pressable onPress={() => handleRetry(row)}>
                            <Text style={styles.editLink}>Retry</Text>
                          </Pressable>
                          <Pressable onPress={() => handleDeleteRow(row)}>
                            <Text style={styles.deleteLink}>Remove</Text>
                          </Pressable>
                        </View>
                      )}
                    </View>
                  )}
                </SurfaceCard>
              ))}
            </View>
          ) : null}

          <View style={styles.footer}>
            <Pressable style={styles.secondaryButton} onPress={() => setStep(3)}>
              <Text style={styles.secondaryButtonLabel}>Change subcategory</Text>
            </Pressable>
            <Pressable style={styles.continueButton} onPress={handleDone}>
              <Text style={styles.continueButtonLabel}>
                {savedCount > 0 ? `Done — ${savedCount} added` : 'Done'}
              </Text>
            </Pressable>
          </View>
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  backLabel: {
    color: palette.primary,
    fontSize: 14,
    fontWeight: typography.weight.semibold,
  },
  stepLabel: {
    color: palette.muted,
    fontSize: 13,
  },
  title: {
    color: palette.text,
    fontSize: 22,
    fontWeight: typography.weight.bold,
    marginBottom: 16,
  },
  optionList: {
    gap: 10,
    marginBottom: 20,
  },
  optionCard: {
    backgroundColor: palette.surface,
    borderColor: palette.border,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  optionCardActive: {
    backgroundColor: palette.primary,
    borderColor: palette.primary,
  },
  optionLabel: {
    color: palette.text,
    fontSize: 15,
    fontWeight: typography.weight.semibold,
  },
  optionLabelActive: {
    color: palette.surface,
  },
  optionDescription: {
    color: palette.muted,
    fontSize: 13,
    marginTop: 4,
  },
  continueButton: {
    alignItems: 'center',
    backgroundColor: palette.primary,
    borderRadius: 16,
    paddingVertical: 14,
  },
  continueButtonDisabled: {
    opacity: 0.4,
  },
  continueButtonLabel: {
    color: palette.surface,
    fontSize: 15,
    fontWeight: typography.weight.semibold,
  },
  input: {
    backgroundColor: palette.surface,
    borderColor: palette.border,
    borderRadius: 10,
    borderWidth: 1,
    color: palette.text,
    fontSize: 14,
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  multiline: {
    minHeight: 60,
    textAlignVertical: 'top',
  },
  subSubSection: {
    marginTop: 16,
  },
  subLabel: {
    color: palette.text,
    fontSize: 13,
    fontWeight: typography.weight.semibold,
    marginBottom: 8,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  spaced: {
    marginTop: 12,
  },
  chip: {
    backgroundColor: palette.background,
    borderColor: palette.border,
    borderRadius: 999,
    borderWidth: 1,
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
  moreOptionsLabel: {
    color: palette.primary,
    fontSize: 13,
    fontWeight: typography.weight.semibold,
    marginTop: 12,
  },
  entryRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  entryName: {
    flex: 2,
    marginTop: 0,
  },
  entryPrice: {
    flex: 1,
    marginTop: 0,
  },
  addRowButton: {
    backgroundColor: palette.primary,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  addRowButtonLabel: {
    color: palette.surface,
    fontSize: 13,
    fontWeight: typography.weight.semibold,
  },
  rowList: {
    gap: 10,
    marginTop: 12,
  },
  rowItem: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rowInfo: {
    flex: 1,
    marginRight: 12,
  },
  rowName: {
    color: palette.text,
    fontSize: 15,
    fontWeight: typography.weight.semibold,
  },
  rowPrice: {
    color: palette.muted,
    fontSize: 13,
  },
  rowError: {
    color: '#a83a2f',
    fontSize: 12,
    marginTop: 2,
  },
  rowActions: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  savedCheck: {
    color: '#2f7a3e',
    fontSize: 16,
    fontWeight: typography.weight.bold,
  },
  editLink: {
    color: palette.primary,
    fontSize: 13,
    fontWeight: typography.weight.semibold,
  },
  deleteLink: {
    color: '#a83a2f',
    fontSize: 13,
    fontWeight: typography.weight.semibold,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
    marginBottom: 24,
  },
  secondaryButton: {
    alignItems: 'center',
    borderColor: palette.border,
    borderRadius: 16,
    borderWidth: 1,
    flex: 1,
    paddingVertical: 14,
  },
  secondaryButtonLabel: {
    color: palette.text,
    fontSize: 14,
    fontWeight: typography.weight.semibold,
  },
});
