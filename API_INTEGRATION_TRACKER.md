# 📡 API Integration Tracker — Lubist Mobile ↔ Backend

> Single source of truth for which backend endpoints have been wired into the
> mobile app (Expo RN + TanStack Query). Keep this updated as we integrate.
>
> **Backend base URL:** `http://localhost:8000` · **Global prefix:** `/api/v1`
> **Backend repo:** `g:\vescavia\Projects\backend` · **Mobile repo:** `g:\vescavia\Projects\lubist_mobile_application`
> **Shared with:** salon web admin panel (same backend)

---

## How to use this doc

- Each endpoint row tracks: **Method**, **Path** (after `/api/v1`), **Auth**, **TanStack hook**, **Consuming screen**, **Status**.
- Update the **Status** and the **Progress summary** every time we integrate or change something.
- When asked to "continue API integration", I (Claude) read this file first to know where we left off.

### Status legend
| Symbol | Meaning |
|--------|---------|
| ⬜ | Not started |
| 🟡 | Hook created (not yet wired to a screen) |
| 🟢 | Wired into UI (works end-to-end, not formally tested) |
| ✅ | Verified / tested |
| ➖ | Not needed on mobile (admin/web-only) |

---

## 📊 Progress summary

| Domain | Total | Integrated (🟢/✅) | Mobile priority |
|--------|------:|------------------:|-----------------|
| Auth | 16 | 13 | 🔴 High |
| Location | 3 | 2 | 🔴 High |
| Salons (public) | 16 | 6 | 🔴 High |
| Bookings | 8 | 0 | 🔴 High |
| Customers (cart/fav/reviews) | 23 | 6 | 🔴 High |
| Products | 8 | 0 | 🔴 High |
| Product Orders | 4 | 0 | 🔴 High |
| Payments | 8 | 1 | 🟠 Medium |
| Vendors | 15 | 0 | 🟠 Medium |
| RM | 12 | 0 | 🟡 Low |
| Careers | 6 | 0 | 🟡 Low |
| Upload | 6 | 0 | 🟠 Medium |
| Admin (all sub-routers) | 45 | 0 | ➖ Web-only |
| **TOTAL** | **170** | **28** | |

**Overall: 28 / 170 endpoints integrated (~16%).**

---

## 🧱 Integration infrastructure (foundation)

| Item | Status | Notes / TODO |
|------|--------|--------------|
| TanStack Query provider | ✅ | `src/app/providers/AppProviders.tsx` |
| Base fetch client (`apiGet`/`apiPost`) | 🟢 | `src/services/api/client.ts` — **added auth headers, PUT/PATCH/DELETE helpers, and auto refresh-on-401** |
| Device location (`expo-location`) | 🟢 | `src/services/location/useDeviceLocation.ts` — **GPS + permission flow, used by ClientHome** |
| Razorpay checkout (WebView) | 🟢 | `src/features/client/components/RazorpayCheckout.tsx` — **Expo Go-compatible; native SDK avoided** |
| Auth token storage | 🟢 | `src/services/storage/tokenStorage.ts` — **using `expo-secure-store` persistence** |
| AuthContext (real session) | 🟢 | `src/store/AuthContext.tsx` — **holds real token + user, auto-restores login on launch** |
| Query key conventions | ⬜ | Define a `queryKeys` factory once we add `useQuery` reads |
| Centralized error handling | ⬜ | Map backend `{detail}` shape to UI toasts |
| Env config per environment | 🟡 | `src/app/config/env.ts` hardcodes localhost — add staging/prod |

> ⚠️ These foundations should be finished early — most read endpoints below need an
> auth header, and almost every protected route needs the real AuthContext.

---

## 🔐 Auth — `/api/v1/auth`
File: `backend/app/api/auth.py` · Mobile hooks: `src/services/api/hooks/useAuthAPI.ts`

| Method | Path | Auth | Hook | Screen | Status |
|--------|------|------|------|--------|--------|
| POST | `/auth/login` | public | `useLogin` | EmailLoginScreen | 🟢 |
| POST | `/auth/signup` | public | `useSignup` | OtpVerifyScreen | 🟢 |
| POST | `/auth/refresh` | public | (auto via client) | — | 🟢 |
| GET | `/auth/me` | bearer | `useGetUserProfile` | ProfileScreen | 🟢 |
| PUT | `/auth/me` | bearer | `useUpdateUserProfile` | ProfileScreen | 🟢 |
| POST | `/auth/logout` | bearer | `useLogout` | ProfileScreen | 🟢 |
| POST | `/auth/logout-all` | bearer | `useLogoutAll` | ProfileScreen | 🟢 |
| POST | `/auth/password-reset` | public | `usePasswordReset` | ForgotPasswordScreen | 🟢 |
| POST | `/auth/password-reset/confirm` | public | `usePasswordResetConfirm` | — | ⬜ |
| POST | `/auth/resend-verification` | public | `useResendVerification` | — | ⬜ |
| POST | `/auth/signup/phone/send-otp` | public | `useSendSignupPhoneOtp` | SignupScreen | 🟢 |
| POST | `/auth/signup/phone/verify-otp` | public | `useVerifySignupPhoneOtp` | OtpVerifyScreen | 🟢 |
| POST | `/auth/login/phone/send-otp` | public | `useSendPhoneOtp` | SignInScreen | 🟢 |
| POST | `/auth/login/phone/verify-otp` | public | `useVerifyPhoneOtp` | OtpVerifyScreen | 🟢 |
| POST | `/auth/verify-phone/send-otp` | bearer | `useSendVerifyPhoneOtp` | — | ⬜ |
| POST | `/auth/verify-phone/confirm-otp` | bearer | `useConfirmVerifyPhoneOtp` | — | ⬜ |

---

## 📍 Location — `/api/v1/location`
File: `backend/app/api/location.py`

| Method | Path | Auth | Hook | Screen | Status |
|--------|------|------|------|--------|--------|
| POST | `/location/geocode` | public | — | — | ⬜ |
| GET | `/location/reverse-geocode` | public | `useReverseGeocode` | ClientHome | 🟢 |
| GET | `/location/salons/nearby` | public | `useNearbySalons` | ClientHome | 🟢 |

---

## 🏪 Salons (public + vendor-owner) — `/api/v1/salons`
File: `backend/app/api/salons.py`

| Method | Path | Auth | Hook | Screen | Status |
|--------|------|------|------|--------|--------|
| GET | `/salons/public` | public | `usePublicSalons` | ClientDiscover | 🟢 |
| GET | `/salons/popular-cities` | public | — | ClientHome | ⬜ |
| GET | `/salons/` | public | — | ClientDiscover | ⬜ |
| GET | `/salons/{salon_id}` | public | `useSalonDetail` | SalonDetailsScreen | 🟢 |
| GET | `/salons/{salon_id}/reviews` | public | `useSalonReviews` | SalonDetailsScreen | 🟢 |
| GET | `/salons/{salon_id}/feedback` | public | — | — | ⬜ |
| POST | `/salons/{salon_id}/feedback` | bearer | — | — | ⬜ |
| GET | `/salons/{salon_id}/services` | public | `useSalonServices` (taxonomy) | SalonServicesScreen | 🟢 |
| GET | `/salons/{salon_id}/available-slots` | public | `useAvailableSlots` | SelectTimeScreen | 🟢 |
| GET | `/salons/search/nearby` | public | — | ClientDiscover | ⬜ |
| GET | `/salons/search/query` | public | `useSearchSalons` | ClientDiscover | 🟢 |
| POST | `/salons/` | bearer (vendor) | — | — | ⬜ |
| PATCH | `/salons/{salon_id}` | bearer (vendor) | — | — | ⬜ |
| POST | `/salons/{salon_id}/approve` | bearer (admin/rm) | — | — | ➖ |
| POST | `/salons/{salon_id}/images` | bearer (vendor) | — | — | ⬜ |
| GET | `/salons/config/public` | public | — | — | ⬜ |

---

## 📅 Bookings — `/api/v1/bookings`
File: `backend/app/api/bookings.py`

| Method | Path | Auth | Hook | Screen | Status |
|--------|------|------|------|--------|--------|
| GET | `/bookings/` | bearer | — | — | ⬜ |
| GET | `/bookings/user/{user_id}` | bearer | — | — | ⬜ |
| GET | `/bookings/salon/{salon_id}` | bearer | — | — | ⬜ |
| GET | `/bookings/{booking_id}` | bearer | — | — | ⬜ |
| POST | `/bookings/` | bearer | — | Checkout / BookingConfirmed | ⬜ |
| PATCH | `/bookings/{booking_id}` | bearer | — | — | ⬜ |
| POST | `/bookings/{booking_id}/cancel` | bearer | — | ClientAppointments | ⬜ |
| POST | `/bookings/{booking_id}/complete` | bearer | — | — | ⬜ |

> Note: customer-facing booking flow is largely under `/customers/*` below — decide which set is canonical for the client app.

---

## 🛍️ Customers (cart / favorites / reviews / browse) — `/api/v1/customers`
File: `backend/app/api/customers.py` — **most important for the client app**

| Method | Path | Auth | Hook | Screen | Status |
|--------|------|------|------|--------|--------|
| GET | `/customers/cart` | bearer | `useCart` | SalonServices / SelectTime / Checkout | 🟢 |
| POST | `/customers/cart` | bearer | `useAddToCart` | SalonServices | 🟢 |
| PUT | `/customers/cart/{item_id}` | bearer | `useUpdateCartItem` | (hook ready) | 🟡 |
| DELETE | `/customers/cart/{item_id}` | bearer | `useRemoveCartItem` | SalonServices | 🟢 |
| DELETE | `/customers/cart/clear/all` | bearer | `useClearCart` | (hook ready) | 🟡 |
| POST | `/customers/cart/checkout` | bearer | `useCheckoutCart` | CheckoutScreen | 🟢 |
| GET | `/customers/product-cart` | bearer | — | ClientShopping | ⬜ |
| POST | `/customers/product-cart` | bearer | — | ProductDetail | ⬜ |
| PUT | `/customers/product-cart/{item_id}` | bearer | — | ClientShopping | ⬜ |
| DELETE | `/customers/product-cart/{item_id}` | bearer | — | ClientShopping | ⬜ |
| DELETE | `/customers/product-cart/clear/all` | bearer | — | ClientShopping | ⬜ |
| GET | `/customers/bookings/my-bookings` | bearer | `useMyBookings` | ClientAppointments | 🟢 |
| PUT | `/customers/bookings/{booking_id}/cancel` | bearer | `useCancelBooking` | ClientAppointments | 🟢 |
| POST | `/customers/bookings` | bearer | — | (cart/checkout used instead) | ➖ |
| GET | `/customers/salons` | bearer | — | ClientDiscover | ⬜ |
| GET | `/customers/salons/search` | bearer | — | ClientDiscover | ⬜ |
| GET | `/customers/salons/{salon_id}` | bearer | — | SalonDetails | ⬜ |
| GET | `/customers/favorites` | bearer | — | ClientAccount | ⬜ |
| POST | `/customers/favorites` | bearer | — | SalonDetails | ⬜ |
| DELETE | `/customers/favorites/{salon_id}` | bearer | — | SalonDetails | ⬜ |
| GET | `/customers/reviews/my-reviews` | bearer | — | ClientAccount | ⬜ |
| POST | `/customers/reviews` | bearer | — | SalonDetails | ⬜ |
| PUT | `/customers/reviews/{review_id}` | bearer | — | — | ⬜ |

---

## 🧴 Products — `/api/v1/products`
File: `backend/app/api/products.py`

| Method | Path | Auth | Hook | Screen | Status |
|--------|------|------|------|--------|--------|
| GET | `/products` | public | — | ProductCatalog / ClientShopping | ⬜ |
| GET | `/products/categories` | public | — | ProductCatalog | ⬜ |
| GET | `/products/slug/{slug}` | public | — | ProductDetail | ⬜ |
| GET | `/products/{product_id}` | public | — | ProductDetail | ⬜ |
| GET | `/products/admin/all` | bearer (admin) | — | — | ➖ |
| POST | `/products` | bearer (admin) | — | — | ➖ |
| PUT | `/products/{product_id}` | bearer (admin) | — | — | ➖ |
| DELETE | `/products/{product_id}` | bearer (admin) | — | — | ➖ |

---

## 📦 Product Orders — `/api/v1/product-orders`
File: `backend/app/api/product_orders.py`

| Method | Path | Auth | Hook | Screen | Status |
|--------|------|------|------|--------|--------|
| POST | `/product-orders/create` | bearer | — | Checkout | ⬜ |
| POST | `/product-orders/verify` | bearer | — | Checkout | ⬜ |
| POST | `/product-orders/dev-verify/{order_id}` | bearer | — | (dev only) | ⬜ |
| GET | `/product-orders/my-orders` | bearer | — | ClientAccount | ⬜ |

---

## 💳 Payments — `/api/v1/payments`
File: `backend/app/api/payments.py`

| Method | Path | Auth | Hook | Screen | Status |
|--------|------|------|------|--------|--------|
| POST | `/payments/booking/create-order` | bearer | — | Checkout | ⬜ |
| POST | `/payments/booking/verify` | bearer | — | Checkout | ⬜ |
| POST | `/payments/cart/create-order` | bearer | `useCreateCartOrder` | Checkout (Razorpay WebView) | 🟢 |
| POST | `/payments/registration/create-order` | bearer (vendor) | — | — | ⬜ |
| POST | `/payments/registration/verify` | bearer (vendor) | — | — | ⬜ |
| GET | `/payments/history` | bearer | — | ClientAccount | ⬜ |
| GET | `/payments/vendor/earnings` | bearer (vendor) | — | VendorDashboard | ⬜ |
| POST | `/payments/webhook/razorpay` | webhook | — | (server only) | ➖ |

---

## 🧑‍💼 Vendors — `/api/v1/vendors`
File: `backend/app/api/vendors.py`

| Method | Path | Auth | Hook | Screen | Status |
|--------|------|------|------|--------|--------|
| POST | `/vendors/complete-registration` | bearer | — | — | ⬜ |
| POST | `/vendors/process-payment` | bearer | — | — | ⬜ |
| GET | `/vendors/salon` | bearer | — | VendorProfile | ⬜ |
| PUT | `/vendors/salon` | bearer | — | VendorProfile | ⬜ |
| GET | `/vendors/service-categories` | bearer | — | — | ⬜ |
| GET | `/vendors/services` | bearer | — | VendorDashboard | ⬜ |
| POST | `/vendors/services` | bearer | — | VendorDashboard | ⬜ |
| PUT | `/vendors/services/{service_id}` | bearer | — | VendorDashboard | ⬜ |
| DELETE | `/vendors/services/{service_id}` | bearer | — | VendorDashboard | ⬜ |
| GET | `/vendors/promotions/active` | bearer | — | — | ⬜ |
| POST | `/vendors/promotions/apply` | bearer | — | — | ⬜ |
| GET | `/vendors/bookings` | bearer | — | VendorBookings | ⬜ |
| PUT | `/vendors/bookings/{booking_id}/status` | bearer | — | VendorBookings | ⬜ |
| GET | `/vendors/dashboard` | bearer | — | VendorDashboard | ⬜ |
| GET | `/vendors/analytics` | bearer | — | VendorDashboard | ⬜ |

---

## 🤝 Relationship Manager — `/api/v1/rm`
File: `backend/app/api/rm.py`

| Method | Path | Auth | Hook | Screen | Status |
|--------|------|------|------|--------|--------|
| POST | `/rm/vendor-requests` | bearer (rm) | — | — | ⬜ |
| PUT | `/rm/vendor-requests/{request_id}` | bearer (rm) | — | — | ⬜ |
| DELETE | `/rm/vendor-requests/{request_id}` | bearer (rm) | — | — | ⬜ |
| GET | `/rm/vendor-requests` | bearer (rm) | — | — | ⬜ |
| GET | `/rm/vendor-requests/{request_id}` | bearer (rm) | — | — | ⬜ |
| GET | `/rm/salons` | bearer (rm) | — | RMHome | ⬜ |
| GET | `/rm/profile` | bearer (rm) | — | RMHome | ⬜ |
| PUT | `/rm/profile` | bearer (rm) | — | — | ⬜ |
| GET | `/rm/score-history` | bearer (rm) | — | — | ⬜ |
| GET | `/rm/dashboard` | bearer (rm) | — | RMHome | ⬜ |
| GET | `/rm/leaderboard` | bearer (rm) | — | — | ⬜ |
| GET | `/rm/service-categories` | bearer (rm) | — | — | ⬜ |

---

## 💼 Careers — `/api/v1/careers`
File: `backend/app/api/careers.py`

| Method | Path | Auth | Hook | Screen | Status |
|--------|------|------|------|--------|--------|
| POST | `/careers/apply` | public | — | (careers feature) | ⬜ |
| GET | `/careers/applications` | bearer (admin) | — | — | ➖ |
| GET | `/careers/applications/{application_id}` | bearer (admin) | — | — | ➖ |
| GET | `/careers/applications/by-number/{number}` | public | — | — | ⬜ |
| PATCH | `/careers/applications/{application_id}` | bearer (admin) | — | — | ➖ |
| GET | `/careers/applications/{application_id}/download/{type}` | bearer (admin) | — | — | ➖ |

---

## ⬆️ Upload — `/api/v1/upload`
File: `backend/app/api/upload.py` · Mobile helper: `src/services/upload/uploadService.ts`

| Method | Path | Auth | Hook | Screen | Status |
|--------|------|------|------|--------|--------|
| POST | `/upload/salon-image` | bearer (vendor) | — | — | ⬜ |
| POST | `/upload/salon-images/multiple` | bearer (vendor) | — | — | ⬜ |
| POST | `/upload/cloudinary-product-image` | bearer | — | — | ⬜ |
| POST | `/upload/agreement-document` | bearer | — | — | ⬜ |
| DELETE | `/upload/salon-image` | bearer (vendor) | — | — | ⬜ |
| GET | `/upload/agreement-document/signed-url` | bearer | — | — | ⬜ |

---

## 🛠️ Admin — `/api/v1/admin/*` (web admin panel; ➖ on mobile)
File: `backend/app/api/admin/` — listed for completeness; primarily consumed by `salon-admin-panel`.

<details>
<summary>Expand admin endpoints (45)</summary>

| Method | Path | Sub-router |
|--------|------|-----------|
| GET | `/admin/stats` | dashboard |
| GET | `/admin/recent-activity` | dashboard |
| GET | `/admin/users/` | users |
| POST | `/admin/users/` | users |
| PUT | `/admin/users/{user_id}` | users |
| DELETE | `/admin/users/{user_id}` | users |
| GET | `/admin/salons/` | salons |
| PUT | `/admin/salons/{salon_id}` | salons |
| DELETE | `/admin/salons/{salon_id}` | salons |
| PUT | `/admin/salons/{salon_id}/status` | salons |
| POST | `/admin/salons/{salon_id}/send-payment-reminder` | salons |
| GET | `/admin/rms` | rms |
| GET | `/admin/rms/{rm_id}` | rms |
| GET | `/admin/rms/{rm_id}/score-history` | rms |
| PUT | `/admin/rms/{rm_id}` | rms |
| GET | `/admin/vendor-requests` | vendor_requests |
| GET | `/admin/vendor-requests/{request_id}` | vendor_requests |
| POST | `/admin/vendor-requests/{request_id}/approve` | vendor_requests |
| POST | `/admin/vendor-requests/{request_id}/reject` | vendor_requests |
| GET | `/admin/bookings/` | bookings |
| PUT | `/admin/bookings/{booking_id}/status` | bookings |
| GET | `/admin/service-categories` | service_categories |
| GET | `/admin/service-categories/{category_id}` | service_categories |
| POST | `/admin/service-categories` | service_categories |
| PUT | `/admin/service-categories/{category_id}` | service_categories |
| PATCH | `/admin/service-categories/{category_id}/toggle-status` | service_categories |
| DELETE | `/admin/service-categories/{category_id}` | service_categories |
| POST | `/admin/service-categories/reorder` | service_categories |
| POST | `/admin/service-categories/upload-icon` | service_categories |
| GET | `/admin/service-categories/{category_id}/subcategories` | service_subcategories |
| POST | `/admin/service-categories/{category_id}/subcategories` | service_subcategories |
| GET | `/admin/service-categories/subcategories/{subcategory_id}` | service_subcategories |
| PUT | `/admin/service-categories/subcategories/{subcategory_id}` | service_subcategories |
| PATCH | `/admin/service-categories/subcategories/{subcategory_id}/toggle-status` | service_subcategories |
| DELETE | `/admin/service-categories/subcategories/{subcategory_id}` | service_subcategories |
| GET | `/admin/service-categories/all-subcategories` | service_subcategories |
| GET | `/admin/config` | config |
| GET | `/admin/config/available-keys` | config |
| GET | `/admin/config/{config_key}` | config |
| POST | `/admin/config` | config |
| PUT | `/admin/config/{config_key}` | config |
| DELETE | `/admin/config/{config_key}` | config |
| POST | `/admin/config/cleanup/expired-tokens` | config |
| GET | `/admin/product-orders/` | product_orders |
| PATCH | `/admin/product-orders/{order_id}/status` | product_orders |

</details>

---

## 🔭 Backend v2 / gap notes (to discuss)

Candidates we flagged for a possible `/api/v2` or backend tweaks to better serve mobile:

- [ ] **Home-feed aggregation endpoint** — combine `popular-cities` + `nearby` + `categories` into one call to cut mobile round-trips on `ClientHomeScreen`.
- [ ] **Consistent pagination** (cursor-based) across list endpoints for infinite scroll.
- [ ] **Canonical booking surface** — `/bookings/*` vs `/customers/bookings/*` overlap; pick one for the client app.
- [ ] **Slimmer mobile DTOs** — some list responses may be heavier than mobile needs.
- [ ] _(add items here as they come up)_

---

_Last updated: 2026-06-08 · Maintained jointly by the team + Claude Code._
