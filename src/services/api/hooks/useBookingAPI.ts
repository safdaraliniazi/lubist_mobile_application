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
  total_amount?: number;
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

/** Creates the Razorpay order for the current cart (convenience fee). */
export function useCreateCartOrder() {
  return useMutation({
    mutationFn: async () => await apiPost<RazorpayOrder>('/api/v1/payments/cart/create-order', {}),
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
