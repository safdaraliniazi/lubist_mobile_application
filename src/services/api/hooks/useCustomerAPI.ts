import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost, apiDelete } from '../client';

// ==========================================
// FAVORITES (mapped from backend customers.py)
// ==========================================

// The backend returns full salon rows for favorites, so `id` is the salon id.
export interface FavoriteItem {
  id?: string;
  salon_id?: string;
  business_name?: string;
  city?: string | null;
  state?: string | null;
  average_rating?: number | null;
  total_reviews?: number | null;
  logo_url?: string | null;
  cover_images?: string[] | null;
  salon_type?: string | null;
  salon?: { id?: string; [k: string]: any } | null;
  [k: string]: any;
}

export interface FavoritesResponse {
  success: boolean;
  favorites: FavoriteItem[];
  count: number;
}

/** Normalize the salon id off a favorite row (full salon row, joined row, or id). */
export const favoriteSalonId = (f: FavoriteItem) => f.salon_id ?? f.salon?.id ?? f.id ?? null;

export function useFavorites(enabled = true) {
  return useQuery({
    queryKey: ['favorites'],
    enabled,
    queryFn: async () => await apiGet<FavoritesResponse>('/api/v1/customers/favorites'),
  });
}

export function useAddFavorite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (salonId: string) =>
      await apiPost('/api/v1/customers/favorites', { salon_id: salonId }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['favorites'] }),
  });
}

export function useRemoveFavorite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (salonId: string) =>
      await apiDelete(`/api/v1/customers/favorites/${salonId}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['favorites'] }),
  });
}
