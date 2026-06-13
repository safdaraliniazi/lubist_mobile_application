import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiDelete, apiGet, apiPost, apiPut } from '../client';
import { resolveImageUrl } from '../imageUrl';

// ==========================================
// TYPES (mapped from backend/app/api/products.py — products table rows)
// ==========================================

export interface Product {
  id: string;
  name: string;
  slug?: string | null;
  description?: string | null;
  short_description?: string | null;
  price: number;
  discount_price?: number | null;
  discount_percentage?: number | null;
  sku?: string | null;
  category?: string | null;
  brand?: string | null;
  image_urls?: string[] | null;
  stock_quantity?: number | null;
  is_active?: boolean;
  is_featured?: boolean;
  tags?: string[] | null;
  weight?: string | null;
  // B2B pricing (vendors/regular_buyers); is_b2b_price flags when it's applied.
  b2b_discount_price?: number | null;
  b2b_discount_percentage?: number | null;
  is_b2b_price?: boolean;
  created_at?: string | null;
  [k: string]: any;
}

interface ProductListResponse {
  success: boolean;
  products: Product[];
  count: number;
  offset: number;
  limit: number;
  total?: number | null;
}

interface ProductResponse {
  success: boolean;
  product: Product;
}

interface ProductCategoriesResponse {
  success: boolean;
  categories: string[];
}

interface ListProductsParams {
  category?: string;
  isFeatured?: boolean;
  search?: string;
  limit?: number;
  offset?: number;
  enabled?: boolean;
}

// ==========================================
// PRICE / IMAGE HELPERS
// ==========================================

/**
 * The price actually charged for a product (discount_price when present, else
 * price). For B2B roles the backend already swaps discount_price for the B2B
 * value, so this stays correct without role logic on the client.
 */
export function effectivePrice(product: Product): number {
  return product.discount_price ?? product.price ?? 0;
}

/** Original price to strike through — only meaningful when a discount applies. */
export function originalPrice(product: Product): number | null {
  return product.discount_price != null && product.discount_price < product.price
    ? product.price
    : null;
}

/** "25% OFF" label, or null when there's no discount. */
export function discountLabel(product: Product): string | null {
  const pct = product.discount_percentage;
  if (pct == null || pct <= 0) return null;
  return `${Math.round(pct)}% OFF`;
}

/** Format a rupee amount the way the catalog mocks did (₹986, ₹1,850). */
export function formatPrice(amount: number): string {
  return `₹${Math.round(amount).toLocaleString('en-IN')}`;
}

/** First product image, rewritten for the dev LAN host. Null when none. */
export function productImageUri(product: Product): string | null {
  const first = product.image_urls?.[0];
  return resolveImageUrl(first ?? null);
}

// ==========================================
// HOOKS
// ==========================================

/** List/search products with optional category, featured, and text filters. */
export function useProducts({
  category,
  isFeatured,
  search,
  limit = 50,
  offset = 0,
  enabled = true,
}: ListProductsParams = {}) {
  return useQuery({
    queryKey: ['products', category ?? null, isFeatured ?? null, search ?? null, limit, offset],
    enabled,
    queryFn: async () => {
      const params = new URLSearchParams({ limit: String(limit), offset: String(offset) });
      if (category) params.set('category', category);
      if (isFeatured != null) params.set('is_featured', String(isFeatured));
      if (search?.trim()) params.set('search', search.trim());
      return await apiGet<ProductListResponse>(`/api/v1/products?${params.toString()}`);
    },
  });
}

/** Featured products for the "Trending now" carousel. */
export function useFeaturedProducts(limit = 10) {
  return useProducts({ isFeatured: true, limit });
}

/** Distinct product categories for filter chips / "shop by category". */
export function useProductCategories() {
  return useQuery({
    queryKey: ['productCategories'],
    queryFn: async () =>
      await apiGet<ProductCategoriesResponse>('/api/v1/products/categories'),
  });
}

/** Single product by UUID. */
export function useProduct(productId?: string) {
  return useQuery({
    queryKey: ['product', productId ?? null],
    enabled: !!productId,
    queryFn: async () => await apiGet<ProductResponse>(`/api/v1/products/${productId}`),
  });
}

/** Single product by SEO-friendly slug. */
export function useProductBySlug(slug?: string) {
  return useQuery({
    queryKey: ['productSlug', slug ?? null],
    enabled: !!slug,
    queryFn: async () => await apiGet<ProductResponse>(`/api/v1/products/slug/${slug}`),
  });
}

// ==========================================
// PRODUCT CART (mapped from backend customers.py /product-cart/*)
// All routes require a bearer token; these screens are only reachable when
// logged in as a customer, so the queries can stay enabled.
// ==========================================

/** A processed product-cart line item (backend already computes price/total). */
export interface ProductCartItem {
  id: string;
  product_id: string;
  name?: string | null;
  price: number;
  quantity: number;
  image_url?: string | null;
  image_urls?: string[];
  total: number;
  is_b2b_price?: boolean;
}

export interface ProductCartResponse {
  success: boolean;
  items: ProductCartItem[];
  total_amount: number;
  item_count: number;
}

const PRODUCT_CART_KEY = ['productCart'];

/** Full product cart with computed line totals and grand total. */
export function useProductCart() {
  return useQuery({
    queryKey: PRODUCT_CART_KEY,
    queryFn: async () => await apiGet<ProductCartResponse>('/api/v1/customers/product-cart'),
  });
}

/** Add a product to the cart (or increment its quantity). */
export function useAddToProductCart() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { product_id: string; quantity?: number }) =>
      await apiPost('/api/v1/customers/product-cart', { quantity: 1, ...data }),
    onSuccess: () => qc.invalidateQueries({ queryKey: PRODUCT_CART_KEY }),
  });
}

/** Set a cart line's quantity (backend removes the line when quantity <= 0). */
export function useUpdateProductCartItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ itemId, quantity }: { itemId: string; quantity: number }) =>
      await apiPut(`/api/v1/customers/product-cart/${itemId}`, { quantity }),
    onSuccess: () => qc.invalidateQueries({ queryKey: PRODUCT_CART_KEY }),
  });
}

/** Remove a single line from the cart. */
export function useRemoveProductCartItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (itemId: string) =>
      await apiDelete(`/api/v1/customers/product-cart/${itemId}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: PRODUCT_CART_KEY }),
  });
}

/** Empty the entire product cart. */
export function useClearProductCart() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => await apiDelete('/api/v1/customers/product-cart/clear/all'),
    onSuccess: () => qc.invalidateQueries({ queryKey: PRODUCT_CART_KEY }),
  });
}

// ==========================================
// PRODUCT FAVORITES (mapped from backend customers.py /favorites/products)
// Powers the "Saved" tab's products segment. All routes require a bearer
// token, so the query is gated by `enabled` on screens reachable while logged
// out (Saved tab, product detail for guests).
// ==========================================

/** Backend returns full product rows under `favorites`, mirroring salon favorites. */
export interface ProductFavoritesResponse {
  success: boolean;
  favorites: Product[];
  count: number;
}

export const PRODUCT_FAVORITES_KEY = ['productFavorites'];

/** The customer's saved products (active products only). */
export function useFavoriteProducts(enabled = true) {
  return useQuery({
    queryKey: PRODUCT_FAVORITES_KEY,
    enabled,
    queryFn: async () =>
      await apiGet<ProductFavoritesResponse>('/api/v1/customers/favorites/products'),
  });
}

/** Add a product to the saved list. */
export function useAddFavoriteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (productId: string) =>
      await apiPost('/api/v1/customers/favorites/products', { product_id: productId }),
    onSuccess: () => qc.invalidateQueries({ queryKey: PRODUCT_FAVORITES_KEY }),
  });
}

/** Remove a product from the saved list. */
export function useRemoveFavoriteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (productId: string) =>
      await apiDelete(`/api/v1/customers/favorites/products/${productId}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: PRODUCT_FAVORITES_KEY }),
  });
}
