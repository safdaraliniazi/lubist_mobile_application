import { AppRole } from '@/navigation/navigation.types';

export const roles: Array<{ label: string; value: AppRole }> = [
  { label: 'Vendor', value: 'vendor' },
  { label: 'Client', value: 'client' },
  { label: 'Admin', value: 'admin' },
  { label: 'RM', value: 'rm' },
];
