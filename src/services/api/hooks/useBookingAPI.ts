import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost, apiPut, apiDelete } from '../client';

// ==========================================
// TYPES (mapped from backend customers.py / payments.py)
// ==========================================

export interface CartItem {
  id: string;
  service_id: string;
  salon_id: string;
  quantity: number;
  unit_price: number;
  line_total: number;
  service_details: { name?: string; duration_minutes?: number; price?: number; [k: string]: any };
  salon_details: Record<string, any>;
}

export interface CartResponse {
  success: boolean;
  items: CartItem[];
  salon_id?: string | null;
  salon_name?: string | null;
  total_amount: number;
  item_count: number;
}

export interface RazorpayOrder {
  order_id: string;
  amount: number;
  amount_paise: number;
  currency: string;
  key_id: string;
  breakdown?: Record<string, any> | null;
}

export interface AvailableSlotsResponse {
  salon_id: string;
  date: string;
  available_slots: string[];
}

export interface CheckoutPayload {
  booking_date: string;
  time_slots: string[];
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  payment_method?: string;
  notes?: string;
  coupon_code?: string;
}

export interface CouponBreakdown {
  subtotal_service_price: number;
  discount_amount: number;
  service_total_due: number;
  convenience_fee_base: number;
  convenience_fee_discount: number;
  convenience_fee_due: number;
  total_amount: number;
  discount_source?: string | null;
}

export interface CouponValidationResult {
  valid: boolean;
  reason?: string | null;
  coupon_id?: string | null;
  coupon_code?: string | null;
  breakdown?: CouponBreakdown | null;
}

/** A customer-discoverable coupon ("available offers"). */
export interface AvailableCoupon {
  id: string;
  code: string;
  title?: string | null;
  scope: string;
  salon_id?: string | null;
  applies_to: string;
  discount_type: string;
  discount_value: number;
  max_discount_cap?: number | null;
  min_order_amount?: number | null;
  first_time_scope?: string | null;
  valid_until?: string | null;
  summary: string;
  subtitle?: string | null;
}

export interface Booking {
  id: string;
  booking_number: string;
  salon_id: string;
  booking_date: string;
  time_slots: string[];
  services: any[];
  status: string;
  payment_status?: string;
  service_price?: number;
  convenience_fee?: number;
  total_amount?: number;
  // Coupon / discount breakdown (0/null for legacy or no-coupon bookings).
  subtotal_service_price?: number | null;
  discount_amount?: number;
  convenience_fee_discount?: number;
  coupon_code?: string | null;
  // Flattened by the backend's booking transform.
  salon_name?: string | null;
  salon_city?: string | null;
  salon_logo_url?: string | null;
  [k: string]: any;
}

export interface MyBookingsResponse {
  success: boolean;
  data: Booking[];
  count: number;
}

// ==========================================
// CART
// ==========================================

export function useCart() {
  return useQuery({
    queryKey: ['cart'],
    queryFn: async () => await apiGet<CartResponse>('/api/v1/customers/cart'),
  });
}

export function useAddToCart() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { service_id: string; salon_id?: string; quantity?: number }) =>
      await apiPost('/api/v1/customers/cart', { quantity: 1, ...data }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['cart'] }),
  });
}

export function useUpdateCartItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ itemId, quantity }: { itemId: string; quantity: number }) =>
      await apiPut(`/api/v1/customers/cart/${itemId}`, { quantity }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['cart'] }),
  });
}

export function useRemoveCartItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (itemId: string) => await apiDelete(`/api/v1/customers/cart/${itemId}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['cart'] }),
  });
}

export function useClearCart() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => await apiDelete('/api/v1/customers/cart/clear/all'),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['cart'] }),
  });
}

// ==========================================
// SLOTS / PAYMENT / CHECKOUT
// ==========================================

export function useAvailableSlots(salonId?: string, date?: string, serviceIds?: string[]) {
  return useQuery({
    queryKey: ['availableSlots', salonId ?? null, date ?? null, serviceIds?.join(',') ?? ''],
    enabled: !!salonId && !!date,
    queryFn: async () => {
      const params = new URLSearchParams({ date: String(date) });
      if (serviceIds?.length) params.set('service_ids', serviceIds.join(','));
      return await apiGet<AvailableSlotsResponse>(
        `/api/v1/salons/${salonId}/available-slots?${params.toString()}`,
      );
    },
  });
}

/**
 * Coupons the customer can discover ("available offers"). Always includes
 * platform coupons; pass a salonId to also include that salon's vendor coupons.
 */
export function useAvailableCoupons(salonId?: string) {
  return useQuery({
    queryKey: ['availableCoupons', salonId ?? null],
    queryFn: async () => {
      const qs = salonId ? `?salon_id=${encodeURIComponent(salonId)}` : '';
      return await apiGet<AvailableCoupon[]>(`/api/v1/customers/available-coupons${qs}`);
    },
  });
}

/** Validates / previews a coupon against the current cart ("Apply coupon"). */
export function useValidateCoupon() {
  return useMutation({
    mutationFn: async (code: string) =>
      await apiPost<CouponValidationResult>('/api/v1/customers/cart/validate-coupon', { code }),
  });
}

/** Creates the Razorpay order for the current cart (convenience fee). */
export function useCreateCartOrder() {
  return useMutation({
    mutationFn: async (couponCode?: string) =>
      await apiPost<RazorpayOrder>(
        '/api/v1/payments/cart/create-order',
        couponCode ? { coupon_code: couponCode } : {},
      ),
  });
}

/** Verifies payment + creates the booking from the cart, then clears the cart. */
export function useCheckoutCart() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: CheckoutPayload) =>
      await apiPost<Booking>('/api/v1/customers/cart/checkout', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['cart'] });
      qc.invalidateQueries({ queryKey: ['myBookings'] });
    },
  });
}

// ==========================================
// BOOKINGS
// ==========================================

export function useMyBookings() {
  return useQuery({
    queryKey: ['myBookings'],
    queryFn: async () => await apiGet<MyBookingsResponse>('/api/v1/customers/bookings/my-bookings'),
  });
}

export function useCancelBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (bookingId: string) =>
      await apiPut(`/api/v1/customers/bookings/${bookingId}/cancel`, {}),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['myBookings'] }),
  });
}
