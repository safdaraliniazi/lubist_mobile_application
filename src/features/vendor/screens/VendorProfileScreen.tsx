import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Linking, Pressable, StyleSheet, Switch, Text, TextInput, View } from 'react-native';

import { PaymentLockedNotice } from '@/features/vendor/components/PaymentLockedNotice';
import { useVendorPaymentGate } from '@/features/vendor/hooks/useVendorPaymentGate';
import {
  useUpdateVendorSalon,
  VendorSalon,
  VendorSalonUpdate,
} from '@/services/api/hooks/useVendorAPI';
import {
  getAgreementDocumentSignedUrl,
  pickDocument,
  pickImage,
  uploadAgreementDocument,
  uploadSalonImage,
} from '@/services/upload/uploadService';
import { useAuth } from '@/store/AuthContext';
import { Screen } from '@/shared/components/Screen';
import { SurfaceCard } from '@/shared/components/SurfaceCard';
import { palette } from '@/theme/palette';
import { typography } from '@/theme/typography';

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;
const DAY_LABELS: Record<(typeof DAYS)[number], string> = {
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
  sunday: 'Sunday',
};

const FACILITIES: { key: string; label: string }[] = [
  { key: 'air_conditioner', label: 'Air Conditioner' },
  { key: 'car_parking', label: 'Car Parking' },
  { key: 'free_wifi', label: 'Free Wi-Fi' },
  { key: 'shower_facility', label: 'Shower Facility' },
  { key: 'steam_room', label: 'Steam Room' },
  { key: 'hygienic_environment', label: 'Hygienic Environment' },
  { key: 'comfortable_seating', label: 'Comfortable Seating' },
  { key: 'sanitized_tools', label: 'Sanitized Tools' },
];

function facilityKey(key: string): string {
  return `facility_${key}`;
}

function buildFormData(salon: VendorSalon): VendorSalonUpdate {
  return {
    business_name: salon.business_name ?? '',
    phone: salon.phone ?? '',
    address: salon.address ?? '',
    city: salon.city ?? '',
    state: salon.state ?? '',
    pincode: salon.pincode ?? '',
    description: salon.description ?? '',
    outlet: salon.outlet ?? null,
    is_gst: salon.is_gst ?? false,
    gst_number: salon.gst_number ?? '',
    business_hours: salon.business_hours ?? {},
    logo_url: salon.logo_url ?? null,
    cover_images: salon.cover_images ?? [],
    agreement_document_url: salon.agreement_document_url ?? null,
    facilities: salon.facilities ?? {},
  };
}

export function VendorProfileScreen() {
  const { signOut } = useAuth();
  const { salon, isPaymentPending, isLoading } = useVendorPaymentGate();
  const updateSalon = useUpdateVendorSalon();

  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<VendorSalonUpdate>({});
  const [uploading, setUploading] = useState<string | null>(null);

  useEffect(() => {
    if (salon) setForm(buildFormData(salon));
  }, [salon]);

  if (isLoading && !salon) {
    return (
      <Screen>
        <ActivityIndicator color={palette.primary} style={styles.loader} />
      </Screen>
    );
  }

  if (isPaymentPending) {
    return <PaymentLockedNotice feeAmount={salon?.registration_fee_amount} />;
  }

  if (!salon) return null;

  function set<K extends keyof VendorSalonUpdate>(key: K, value: VendorSalonUpdate[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function setDayHours(day: string, value: string) {
    setForm((prev) => ({ ...prev, business_hours: { ...(prev.business_hours ?? {}), [day]: value } }));
  }

  function setFacility(key: string, value: boolean) {
    setForm((prev) => ({ ...prev, facilities: { ...(prev.facilities ?? {}), [facilityKey(key)]: value } }));
  }

  async function toggleAcceptingBookings(next: boolean) {
    try {
      await updateSalon.mutateAsync({ accepting_bookings: next });
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to update booking status');
    }
  }

  async function handleUploadLogo() {
    try {
      const asset = await pickImage();
      if (!asset) return;
      setUploading('logo');
      const result = await uploadSalonImage(asset, 'logos');
      set('logo_url', result.url);
    } catch (err: any) {
      Alert.alert('Upload failed', err?.message || 'Could not upload logo');
    } finally {
      setUploading(null);
    }
  }

  async function handleUploadCover() {
    try {
      const asset = await pickImage();
      if (!asset) return;
      setUploading('cover');
      const result = await uploadSalonImage(asset, 'covers');
      const gallery = (form.cover_images ?? []).slice(1);
      set('cover_images', [result.url, ...gallery]);
    } catch (err: any) {
      Alert.alert('Upload failed', err?.message || 'Could not upload cover image');
    } finally {
      setUploading(null);
    }
  }

  async function handleAddGalleryImage() {
    try {
      const asset = await pickImage();
      if (!asset) return;
      setUploading('gallery');
      const result = await uploadSalonImage(asset, 'gallery');
      const current = form.cover_images ?? [];
      const cover = current[0];
      const gallery = current.slice(1);
      set('cover_images', cover ? [cover, ...gallery, result.url] : [result.url, ...gallery]);
    } catch (err: any) {
      Alert.alert('Upload failed', err?.message || 'Could not upload gallery image');
    } finally {
      setUploading(null);
    }
  }

  function removeGalleryImage(index: number) {
    const current = form.cover_images ?? [];
    const cover = current[0];
    const gallery = current.slice(1);
    gallery.splice(index, 1);
    set('cover_images', cover ? [cover, ...gallery] : gallery);
  }

  async function handleUploadAgreement() {
    try {
      const asset = await pickDocument();
      if (!asset) return;
      setUploading('agreement');
      const result = await uploadAgreementDocument(asset);
      set('agreement_document_url', result.path);
    } catch (err: any) {
      Alert.alert('Upload failed', err?.message || 'Could not upload document');
    } finally {
      setUploading(null);
    }
  }

  async function handleViewAgreement() {
    if (!form.agreement_document_url) return;
    try {
      const { signedUrl } = await getAgreementDocumentSignedUrl(form.agreement_document_url);
      await Linking.openURL(signedUrl);
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Could not open document');
    }
  }

  async function handleSave() {
    try {
      await updateSalon.mutateAsync(form);
      setIsEditing(false);
      Alert.alert('Saved', 'Salon profile updated.');
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to save salon profile');
    }
  }

  function handleCancel() {
    // `salon` is guaranteed defined here — the component returns early above when it's not.
    setForm(buildFormData(salon!));
    setIsEditing(false);
  }

  const galleryImages = (form.cover_images ?? []).slice(1);

  return (
    <Screen scrollable>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Salon Profile</Text>
        {isEditing ? (
          <View style={styles.editActions}>
            <Pressable onPress={handleCancel}>
              <Text style={styles.cancelLabel}>Cancel</Text>
            </Pressable>
            <Pressable style={styles.saveButton} disabled={updateSalon.isPending} onPress={handleSave}>
              <Text style={styles.saveButtonLabel}>{updateSalon.isPending ? 'Saving…' : 'Save'}</Text>
            </Pressable>
          </View>
        ) : (
          <Pressable onPress={() => setIsEditing(true)}>
            <Text style={styles.editLabel}>Edit</Text>
          </Pressable>
        )}
      </View>

      <SurfaceCard>
        <View style={styles.statusRow}>
          <View style={[styles.statusDot, { backgroundColor: salon.is_active ? '#2f7a3e' : '#a3691a' }]} />
          <Text style={styles.statusText}>
            {salon.is_active ? 'Active — salon visible & accepting bookings' : 'Inactive — complete payment to activate.'}
          </Text>
        </View>
        <View style={styles.acceptingRow}>
          <Text style={styles.line}>Accepting new bookings</Text>
          <Switch
            value={salon.accepting_bookings}
            onValueChange={toggleAcceptingBookings}
            trackColor={{ true: palette.primary }}
          />
        </View>
      </SurfaceCard>

      <SurfaceCard>
        <Text style={styles.sectionTitle}>Basic Information</Text>
        <Field label="Business Name" value={form.business_name} editable={isEditing} onChangeText={(v) => set('business_name', v)} />
        <Field label="Email" value={salon.email ?? ''} editable={false} />
        <Field label="Phone" value={form.phone} editable={isEditing} onChangeText={(v) => set('phone', v)} keyboardType="phone-pad" />
        <Field label="Address" value={form.address} editable={isEditing} onChangeText={(v) => set('address', v)} />
        <Field label="City" value={form.city} editable={isEditing} onChangeText={(v) => set('city', v)} />
        <Field label="State" value={form.state} editable={isEditing} onChangeText={(v) => set('state', v)} />
        <Field label="Pincode" value={form.pincode} editable={isEditing} onChangeText={(v) => set('pincode', v)} keyboardType="number-pad" />
        <Field label="Description" value={form.description ?? ''} editable={isEditing} onChangeText={(v) => set('description', v)} multiline />
      </SurfaceCard>

      <SurfaceCard>
        <Text style={styles.sectionTitle}>Business Hours</Text>
        {DAYS.map((day) => {
          const value = form.business_hours?.[day] ?? 'Closed';
          const isClosed = value === 'Closed';
          return (
            <View key={day} style={styles.dayRow}>
              <Text style={styles.dayLabel}>{DAY_LABELS[day]}</Text>
              {isEditing ? (
                <TextInput
                  style={styles.dayInput}
                  value={value}
                  placeholder="9:00 AM - 6:00 PM"
                  placeholderTextColor={palette.muted}
                  onChangeText={(v) => setDayHours(day, v)}
                />
              ) : (
                <Text style={isClosed ? styles.lineMuted : styles.line}>{value}</Text>
              )}
              {isEditing ? (
                <Pressable onPress={() => setDayHours(day, isClosed ? '9:00 AM - 6:00 PM' : 'Closed')}>
                  <Text style={styles.toggleDayLabel}>{isClosed ? 'Set Hours' : 'Closed'}</Text>
                </Pressable>
              ) : null}
            </View>
          );
        })}
      </SurfaceCard>

      <SurfaceCard>
        <Text style={styles.sectionTitle}>Facilities</Text>
        <View style={styles.facilitiesGrid}>
          {FACILITIES.map((facility) => {
            const checked = !!form.facilities?.[facilityKey(facility.key)];
            return (
              <Pressable
                key={facility.key}
                style={styles.facilityChip}
                disabled={!isEditing}
                onPress={() => setFacility(facility.key, !checked)}
              >
                <Text style={[styles.facilityLabel, checked && styles.facilityLabelChecked]}>
                  {checked ? '☑' : '☐'} {facility.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </SurfaceCard>

      <SurfaceCard>
        <Text style={styles.sectionTitle}>Salon Images</Text>
        <Text style={styles.subLabel}>Logo</Text>
        {form.logo_url ? <Text style={styles.lineMuted}>{form.logo_url}</Text> : null}
        {isEditing ? (
          <Pressable style={styles.uploadButton} disabled={uploading === 'logo'} onPress={handleUploadLogo}>
            <Text style={styles.uploadButtonLabel}>{uploading === 'logo' ? 'Uploading…' : 'Upload Logo'}</Text>
          </Pressable>
        ) : null}

        <Text style={[styles.subLabel, styles.spaced]}>Cover Image</Text>
        {form.cover_images?.[0] ? <Text style={styles.lineMuted}>{form.cover_images[0]}</Text> : null}
        {isEditing ? (
          <Pressable style={styles.uploadButton} disabled={uploading === 'cover'} onPress={handleUploadCover}>
            <Text style={styles.uploadButtonLabel}>{uploading === 'cover' ? 'Uploading…' : 'Upload Cover'}</Text>
          </Pressable>
        ) : null}

        <Text style={[styles.subLabel, styles.spaced]}>Gallery ({galleryImages.length})</Text>
        {galleryImages.map((url, idx) => (
          <View key={url + idx} style={styles.galleryRow}>
            <Text style={styles.lineMuted} numberOfLines={1}>{url}</Text>
            {isEditing ? (
              <Pressable onPress={() => removeGalleryImage(idx)}>
                <Text style={styles.removeLabel}>Remove</Text>
              </Pressable>
            ) : null}
          </View>
        ))}
        {isEditing ? (
          <Pressable style={styles.uploadButton} disabled={uploading === 'gallery'} onPress={handleAddGalleryImage}>
            <Text style={styles.uploadButtonLabel}>
              {uploading === 'gallery' ? 'Uploading…' : 'Add Gallery Image'}
            </Text>
          </Pressable>
        ) : null}
      </SurfaceCard>

      <SurfaceCard>
        <Text style={styles.sectionTitle}>Agreement Document</Text>
        {form.agreement_document_url ? (
          <>
            <Text style={styles.line}>Document uploaded</Text>
            <Pressable onPress={handleViewAgreement}>
              <Text style={styles.viewLink}>View Document</Text>
            </Pressable>
            {isEditing ? (
              <Pressable style={styles.uploadButton} disabled={uploading === 'agreement'} onPress={handleUploadAgreement}>
                <Text style={styles.uploadButtonLabel}>{uploading === 'agreement' ? 'Uploading…' : 'Replace'}</Text>
              </Pressable>
            ) : null}
          </>
        ) : isEditing ? (
          <Pressable style={styles.uploadButton} disabled={uploading === 'agreement'} onPress={handleUploadAgreement}>
            <Text style={styles.uploadButtonLabel}>{uploading === 'agreement' ? 'Uploading…' : 'Upload Document'}</Text>
          </Pressable>
        ) : (
          <Text style={styles.lineMuted}>No document uploaded</Text>
        )}
      </SurfaceCard>

      <SurfaceCard>
        <Text style={styles.sectionTitle}>Quick Stats</Text>
        <View style={styles.row}>
          <Text style={styles.lineMuted}>Registration Status</Text>
          <Text style={styles.line}>{salon.registration_fee_paid ? 'Paid' : 'Pending'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.lineMuted}>Account Status</Text>
          <Text style={styles.line}>{salon.is_active ? 'Active' : 'Inactive'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.lineMuted}>Member Since</Text>
          <Text style={styles.line}>{new Date(salon.created_at).toLocaleDateString()}</Text>
        </View>
      </SurfaceCard>

      <Pressable onPress={signOut} style={styles.signOutButton}>
        <Text style={styles.signOutLabel}>Sign out</Text>
      </Pressable>
    </Screen>
  );
}

function Field({
  label,
  value,
  editable,
  onChangeText,
  multiline,
  keyboardType,
}: {
  label: string;
  value?: string | null;
  editable: boolean;
  onChangeText?: (v: string) => void;
  multiline?: boolean;
  keyboardType?: 'phone-pad' | 'number-pad';
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {editable ? (
        <TextInput
          style={[styles.fieldInput, multiline && styles.fieldInputMultiline]}
          value={value ?? ''}
          onChangeText={onChangeText}
          multiline={multiline}
          keyboardType={keyboardType}
        />
      ) : (
        <Text style={styles.line}>{value || '—'}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  loader: { marginTop: 40 },
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  title: {
    color: palette.text,
    fontSize: 24,
    fontWeight: typography.weight.bold,
  },
  editLabel: {
    color: palette.primary,
    fontSize: 15,
    fontWeight: typography.weight.semibold,
  },
  editActions: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 16,
  },
  cancelLabel: {
    color: palette.muted,
    fontSize: 15,
  },
  saveButton: {
    backgroundColor: palette.primary,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  saveButtonLabel: {
    color: palette.surface,
    fontSize: 14,
    fontWeight: typography.weight.semibold,
  },
  statusRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  statusDot: {
    borderRadius: 6,
    height: 10,
    width: 10,
  },
  statusText: {
    color: palette.text,
    flex: 1,
    fontSize: 14,
  },
  acceptingRow: {
    alignItems: 'center',
    borderTopColor: palette.border,
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingTop: 14,
  },
  sectionTitle: {
    color: palette.text,
    fontSize: 15,
    fontWeight: typography.weight.semibold,
    marginBottom: 12,
  },
  field: {
    marginBottom: 12,
  },
  fieldLabel: {
    color: palette.muted,
    fontSize: 12,
    marginBottom: 4,
  },
  fieldInput: {
    backgroundColor: palette.background,
    borderColor: palette.border,
    borderRadius: 10,
    borderWidth: 1,
    color: palette.text,
    fontSize: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  fieldInputMultiline: {
    minHeight: 70,
    textAlignVertical: 'top',
  },
  line: {
    color: palette.text,
    fontSize: 14,
  },
  lineMuted: {
    color: palette.muted,
    fontSize: 13,
  },
  dayRow: {
    alignItems: 'center',
    borderTopColor: palette.border,
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  dayLabel: {
    color: palette.text,
    fontSize: 13,
    fontWeight: typography.weight.medium,
    width: 80,
  },
  dayInput: {
    borderColor: palette.border,
    borderRadius: 8,
    borderWidth: 1,
    color: palette.text,
    flex: 1,
    fontSize: 13,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  toggleDayLabel: {
    color: palette.primary,
    fontSize: 12,
    fontWeight: typography.weight.semibold,
  },
  facilitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  facilityChip: {
    borderColor: palette.border,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  facilityLabel: {
    color: palette.muted,
    fontSize: 12,
  },
  facilityLabelChecked: {
    color: palette.text,
    fontWeight: typography.weight.semibold,
  },
  subLabel: {
    color: palette.text,
    fontSize: 13,
    fontWeight: typography.weight.semibold,
  },
  spaced: {
    marginTop: 14,
  },
  uploadButton: {
    alignSelf: 'flex-start',
    borderColor: palette.primary,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  uploadButtonLabel: {
    color: palette.primary,
    fontSize: 13,
    fontWeight: typography.weight.semibold,
  },
  galleryRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'space-between',
    marginTop: 4,
  },
  removeLabel: {
    color: '#a83a2f',
    fontSize: 12,
  },
  viewLink: {
    color: palette.primary,
    fontSize: 13,
    fontWeight: typography.weight.semibold,
    marginTop: 4,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  signOutButton: {
    alignItems: 'center',
    backgroundColor: palette.primary,
    borderRadius: 16,
    marginTop: 8,
    marginBottom: 24,
    paddingVertical: 14,
  },
  signOutLabel: {
    color: palette.surface,
    fontSize: 16,
    fontWeight: typography.weight.semibold,
  },
});
