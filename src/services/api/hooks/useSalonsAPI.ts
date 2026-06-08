import { useQuery } from '@tanstack/react-query';
import { apiGet } from '../client';

// ==========================================
// TYPES (mapped from backend/app/api/salons.py — salons table rows)
// ==========================================

export interface Salon {
  id: string;
  business_name: string;
  description?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  pincode?: string | null;
  phone?: string | null;
  email?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  average_rating?: number | null;
  total_reviews?: number | null;
  logo_url?: string | null;
  cover_images?: string[] | null;
  salon_type?: string | null;
  has_discount?: boolean | null;
  distance_km?: number | null;
}

export interface SalonDetail extends Salon {
  opening_time?: string | null;
  closing_time?: string | null;
  working_days?: string[] | null;
}

export interface SalonService {
  id: string;
  salon_id: string;
  name: string;
  description?: string | null;
  duration_minutes: number;
  price: number;
  discount_percentage?: number | null;
  discounted_price?: number | null;
  category_id?: string | null;
}

export interface SalonReview {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  customer_name: string;
  service_name?: string | null;
  is_verified: boolean;
  vendor_response?: string | null;
}

interface SalonListResponse {
  salons: Salon[];
  count: number;
  offset?: number;
  limit?: number;
}

interface SalonDetailResponse {
  salon: SalonDetail;
  services: SalonService[] | null;
}

interface SalonReviewsResponse {
  success: boolean;
  reviews: SalonReview[];
  count: number;
}

interface PublicSalonsParams {
  city?: string;
  limit?: number;
  offset?: number;
  enabled?: boolean;
}

interface SearchSalonsParams {
  q?: string;
  city?: string;
  state?: string;
  limit?: number;
  enabled?: boolean;
}

// ==========================================
// HOOKS
// ==========================================

/** All public (active + verified + paid) salons. */
export function usePublicSalons({ city, limit = 50, offset = 0, enabled = true }: PublicSalonsParams = {}) {
  return useQuery({
    queryKey: ['publicSalons', city ?? null, limit, offset],
    enabled,
    queryFn: async () => {
      const params = new URLSearchParams({ limit: String(limit), offset: String(offset) });
      if (city) params.set('city', city);
      return await apiGet<SalonListResponse>(`/api/v1/salons/public?${params.toString()}`);
    },
  });
}

/** Single salon detail, including its services. */
export function useSalonDetail(salonId?: string) {
  return useQuery({
    queryKey: ['salonDetail', salonId ?? null],
    enabled: !!salonId,
    queryFn: async () =>
      await apiGet<SalonDetailResponse>(`/api/v1/salons/${salonId}?include_services=true`),
  });
}

/** Publicly visible reviews for a salon. */
export function useSalonReviews(salonId?: string) {
  return useQuery({
    queryKey: ['salonReviews', salonId ?? null],
    enabled: !!salonId,
    queryFn: async () => await apiGet<SalonReviewsResponse>(`/api/v1/salons/${salonId}/reviews`),
  });
}

/** Text/filter search over salons. Only runs when a query/filter is supplied. */
export function useSearchSalons({ q, city, state, limit = 50, enabled = true }: SearchSalonsParams) {
  const hasCriteria = !!(q?.trim() || city || state);
  return useQuery({
    queryKey: ['searchSalons', q ?? null, city ?? null, state ?? null, limit],
    enabled: enabled && hasCriteria,
    queryFn: async () => {
      const params = new URLSearchParams({ limit: String(limit) });
      if (q?.trim()) params.set('q', q.trim());
      if (city) params.set('city', city);
      if (state) params.set('state', state);
      return await apiGet<SalonListResponse>(`/api/v1/salons/search/query?${params.toString()}`);
    },
  });
}
