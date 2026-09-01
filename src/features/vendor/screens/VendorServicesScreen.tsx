import { useMemo, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';

import { PaymentLockedNotice } from '@/features/vendor/components/PaymentLockedNotice';
import { useVendorPaymentGate } from '@/features/vendor/hooks/useVendorPaymentGate';
import { buildTaxonomyIndex, formatTaxonomyLabel, resolveServiceTaxonomy } from '@/features/vendor/utils/serviceTaxonomy';
import {
  useDeleteVendorService,
  useServiceCategories,
  useUpdateVendorService,
  useVendorServices,
  VendorService,
} from '@/services/api/hooks/useVendorAPI';
import { Screen } from '@/shared/components/Screen';
import { SurfaceCard } from '@/shared/components/SurfaceCard';
import { VendorStackParamList, VendorTabParamList } from '@/navigation/navigation.types';
import { palette } from '@/theme/palette';
import { typography } from '@/theme/typography';

type Navigation = BottomTabNavigationProp<VendorTabParamList>;

type GenderFilter = 'all' | 'male' | 'female' | 'both';
type StatusFilter = 'all' | 'active' | 'inactive';

const GENDER_LABEL: Record<'male' | 'female' | 'both', string> = {
  male: 'For men',
  female: 'For women',
  both: 'Unisex',
};

export function VendorServicesScreen() {
  const navigation = useNavigation<Navigation>();
  const stackNavigation = navigation.getParent<NativeStackNavigationProp<VendorStackParamList>>();

  const { salon, isPaymentPending } = useVendorPaymentGate();
  const { data: services, isLoading } = useVendorServices();
  const { data: categories } = useServiceCategories();
  const updateService = useUpdateVendorService();
  const deleteService = useDeleteVendorService();

  const [search, setSearch] = useState('');
  const [genderFilter, setGenderFilter] = useState<GenderFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const taxonomyIndex = useMemo(() => buildTaxonomyIndex(categories ?? []), [categories]);

  const filtered = useMemo(() => {
    return (services ?? []).filter((service) => {
      if (genderFilter !== 'all' && (service.gender_category ?? 'both') !== genderFilter) return false;
      if (statusFilter === 'active' && !service.is_active) return false;
      if (statusFilter === 'inactive' && service.is_active) return false;
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        const path = formatTaxonomyLabel(resolveServiceTaxonomy(service, taxonomyIndex)).toLowerCase();
        const haystack = `${service.name} ${service.description ?? ''} ${path}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [services, genderFilter, statusFilter, search, taxonomyIndex]);

  if (isPaymentPending) {
    return <PaymentLockedNotice feeAmount={salon?.registration_fee_amount} />;
  }

  async function handleToggleActive(service: VendorService) {
    try {
      await updateService.mutateAsync({
        serviceId: service.id,
        update: { is_active: !service.is_active },
      });
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to update service');
    }
  }

  function handleDelete(service: VendorService) {
    Alert.alert('Delete service', `Delete "${service.name}"? This cannot be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteService.mutateAsync(service.id);
          } catch (err: any) {
            Alert.alert('Error', err?.message || 'Failed to delete service');
          }
        },
      },
    ]);
  }

  return (
    <Screen scrollable>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Services</Text>
        <Pressable style={styles.addButton} onPress={() => stackNavigation?.navigate('ServiceAddWizard')}>
          <Text style={styles.addButtonLabel}>+ Add</Text>
        </Pressable>
      </View>

      <TextInput
        style={styles.search}
        placeholder="Search services"
        placeholderTextColor={palette.muted}
        value={search}
        onChangeText={setSearch}
      />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
        {(['all', 'male', 'female', 'both'] as GenderFilter[]).map((filter) => (
          <Pressable
            key={filter}
            style={[styles.chip, genderFilter === filter && styles.chipActive]}
            onPress={() => setGenderFilter(filter)}
          >
            <Text style={[styles.chipLabel, genderFilter === filter && styles.chipLabelActive]}>
              {filter === 'all' ? 'All' : filter === 'both' ? 'Unisex' : filter[0].toUpperCase() + filter.slice(1)}
            </Text>
          </Pressable>
        ))}
        {(['active', 'inactive'] as StatusFilter[]).map((filter) => (
          <Pressable
            key={filter}
            style={[styles.chip, statusFilter === filter && styles.chipActive]}
            onPress={() => setStatusFilter(statusFilter === filter ? 'all' : filter)}
          >
            <Text style={[styles.chipLabel, statusFilter === filter && styles.chipLabelActive]}>
              {filter[0].toUpperCase() + filter.slice(1)}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <Text style={styles.count}>
        Showing {filtered.length} of {services?.length ?? 0} services
      </Text>

      {isLoading && !services ? (
        <ActivityIndicator color={palette.primary} style={styles.loader} />
      ) : filtered.length === 0 ? (
        <SurfaceCard>
          <Text style={styles.emptyText}>
            {services?.length ? 'No services match these filters' : 'No services yet — add your first one'}
          </Text>
        </SurfaceCard>
      ) : (
        <View style={styles.list}>
          {filtered.map((service) => {
            const path = formatTaxonomyLabel(resolveServiceTaxonomy(service, taxonomyIndex));
            return (
              <SurfaceCard key={service.id}>
                <View style={styles.serviceHeader}>
                  <View style={styles.serviceInfo}>
                    <Text style={styles.serviceName}>{service.name}</Text>
                    {path ? <Text style={styles.servicePath}>{path}</Text> : null}
                  </View>
                  <Switch
                    value={service.is_active}
                    onValueChange={() => handleToggleActive(service)}
                    trackColor={{ true: palette.primary }}
                  />
                </View>
                {service.description ? (
                  <Text style={styles.serviceDescription} numberOfLines={2}>
                    {service.description}
                  </Text>
                ) : null}
                <View style={styles.serviceMetaRow}>
                  <View style={styles.priceRow}>
                    {service.discounted_price != null && service.discount_percentage ? (
                      <>
                        <Text style={styles.priceStrike}>₹{service.price}</Text>
                        <Text style={styles.price}>₹{service.discounted_price}</Text>
                        <Text style={styles.discountBadge}>{service.discount_percentage}% OFF</Text>
                      </>
                    ) : (
                      <Text style={styles.price}>{service.price === 0 ? 'FREE' : `₹${service.price}`}</Text>
                    )}
                  </View>
                  <Text style={styles.duration}>{service.duration_minutes} min</Text>
                  <Text style={styles.genderLabel}>{GENDER_LABEL[service.gender_category ?? 'both']}</Text>
                </View>
                <View style={styles.serviceFooter}>
                  <Pressable
                    onPress={() => stackNavigation?.navigate('ServiceConfigure', { serviceId: service.id })}
                  >
                    <Text style={styles.editLink}>Edit</Text>
                  </Pressable>
                  <Pressable onPress={() => handleDelete(service)}>
                    <Text style={styles.deleteLink}>Delete</Text>
                  </Pressable>
                </View>
              </SurfaceCard>
            );
          })}
        </View>
      )}
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
  title: {
    color: palette.text,
    fontSize: 26,
    fontWeight: typography.weight.bold,
  },
  addButton: {
    backgroundColor: palette.primary,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  addButtonLabel: {
    color: palette.surface,
    fontSize: 14,
    fontWeight: typography.weight.semibold,
  },
  search: {
    backgroundColor: palette.surface,
    borderColor: palette.border,
    borderRadius: 14,
    borderWidth: 1,
    color: palette.text,
    fontSize: 14,
    marginBottom: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  filterRow: {
    marginBottom: 10,
  },
  chip: {
    backgroundColor: palette.surface,
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
  count: {
    color: palette.muted,
    fontSize: 12,
    marginBottom: 12,
  },
  loader: {
    marginVertical: 24,
  },
  emptyText: {
    color: palette.muted,
    fontSize: 14,
    textAlign: 'center',
  },
  list: {
    gap: 12,
  },
  serviceHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  serviceInfo: {
    flex: 1,
    marginRight: 12,
  },
  serviceName: {
    color: palette.text,
    fontSize: 16,
    fontWeight: typography.weight.semibold,
  },
  servicePath: {
    color: palette.muted,
    fontSize: 12,
    marginTop: 2,
  },
  serviceDescription: {
    color: palette.muted,
    fontSize: 13,
    marginTop: 6,
  },
  serviceMetaRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 10,
  },
  priceRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  price: {
    color: palette.text,
    fontSize: 15,
    fontWeight: typography.weight.bold,
  },
  priceStrike: {
    color: palette.muted,
    fontSize: 13,
    textDecorationLine: 'line-through',
  },
  discountBadge: {
    backgroundColor: '#fdf1de',
    borderRadius: 6,
    color: '#a3691a',
    fontSize: 11,
    fontWeight: typography.weight.semibold,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  duration: {
    color: palette.muted,
    fontSize: 13,
  },
  genderLabel: {
    color: palette.muted,
    fontSize: 13,
  },
  serviceFooter: {
    borderTopColor: palette.border,
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: 20,
    marginTop: 12,
    paddingTop: 10,
  },
  editLink: {
    color: palette.primary,
    fontSize: 14,
    fontWeight: typography.weight.semibold,
  },
  deleteLink: {
    color: '#a83a2f',
    fontSize: 14,
    fontWeight: typography.weight.semibold,
  },
});
