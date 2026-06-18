# FoodQR — Missing Features

**Analysis Date:** 2026-06-17  
**Last Updated:** 2026-06-18 (after second implementation session)  
**OLD codebase:** `C:\IUCS\Product\GitHub\foodqrweb` (Laravel/PHP)  
**NEW codebase:** `C:\IUCS\Product\GitHub Projects\foodqr` (NestJS + React/Next.js)

> Items marked ✅ have been implemented in the new codebase and removed from the gap list.

---

*All previously listed gaps have been implemented. No open items remain.*

---

## Implemented in This Session ✅

The following items were implemented during the implementation session and removed from the gap list above:

- **1.1** Phone/OTP signup flow (3-step: send OTP, verify OTP, register) → `auth/phone/send-otp`, `auth/phone/verify`, `auth/phone/register`
- **1.2** Guest OTP signup — `POST auth/guest/send-otp`, `POST auth/guest/verify` (phone OTP, creates guest session)
- **1.3** Forgot Password via phone/OTP → `auth/forgot-password/phone`, `auth/reset-password/phone`
- **1.4** Phone number field on registration — `phone` + `countryCode` columns on User entity
- **1.5** Administrator impersonation → `POST auth/impersonate/:userId`
- **2.1** Payment gateways added: Razorpay, PayPal, Paystack, Flutterwave, Bkash
- **2.2** Web redirect payment pages → `GET payment/success`, `payment/fail`, `payment/cancel` with HTML templates
- **2.3** Credit/wallet payment method → `POST payments/credit/:orderId`, `GET payments/credit/balance`
- **3.1** Excel import for items → `POST admin/items/import`
- **3.2** Excel export for items → `GET admin/items/export/excel`
- **3.3** AR image field on items → `arImage` column in item entity
- **3.4** Item video field → `videoUrl` column on Item entity
- **3.5** Soft delete on items → `deletedAt` column, `softDelete`/`restore`/`withDeleted` endpoints
- **3.6** Variation caution field → `caution` column on ItemVariation entity
- **3.7** Variation price_type field → `priceType` column on ItemVariation entity (`addon` / `replace`)
- **3.8** listGroupByAttribute endpoint → `GET admin/item-attributes/items/:itemId/group-by-attribute`
- **4.2** Excel import/export for categories → `GET admin/categories/export/excel`, `POST admin/categories/import`
- **4.3** `variation_only` flag on categories → added to entity and DTO
- **5.1** MenuTemplate CRUD → new `menu-templates` module with full CRUD + apply to branch
- **6.1** Token creation for tables → `POST admin/dining-tables/:id/regenerate-token`
- **6.2** changeStaffStatus on table orders → `PATCH admin/orders/:id/staff`
- **6.3** Export table orders to Excel → `GET admin/orders/export/dining-tables`
- **6.4** Change payment status on table orders → `PATCH admin/orders/:id/payment-status`
- **6.5** Waiter assignment on dining tables → `PATCH admin/dining-tables/:id/waiter`
- **7.1** Separate POS orders page → `GET admin/pos/orders`
- **7.2** POS sub-category drill-down → `GET admin/pos/categories`, `GET admin/pos/categories/:id/sub-categories`
- **8.1–8.4** Role-filtered staff endpoints → waiters, chefs, POS operators, branch managers
- **8.5** Staff saved addresses → `GET admin/staff/:id/addresses`
- **8.6** Staff order history → `GET admin/waiters/:id/orders`, `GET admin/chefs/:id/orders`
- **9.1** Customer address management by admin → `GET admin/customers/:id/addresses`
- **9.2** Customer Excel export → `GET admin/reports/export/customers/excel`
- **9.3** Customer changePassword by admin → `PATCH admin/users/:id/password`
- **9.4** Customer changeImage by admin → `PATCH admin/users/:id/image`
- **9.5** Customer order history (admin) → `GET admin/customers/:id/orders`
- **10.1** QR Revenue Summary widget → `GET admin/reports/qr-revenue-summary`
- **10.2** Customer states widget → `GET admin/reports/customer-states`
- **10.3** Peak orders bar chart → `GET admin/reports/peak-orders-bar-chart`
- **11.1** PDF export for sales report → `GET admin/reports/export/sales/pdf`
- **11.2** PDF export for items report → `GET admin/reports/export/items/pdf`
- **11.3** Credit balance report export → `GET admin/reports/export/credit-balance`
- **11.4** Sales report overview endpoint → `GET admin/reports/sales-overview`
- **12.1** OTP settings management → `GET/POST admin/settings/otp`
- **12.2** SMS gateway configuration → `SmsGatewaysService` with full CRUD, Twilio implementation
- **12.3** License management → new `license` module with activate/deactivate/check
- **12.4** Default access settings → new `default-access` module with user-to-branch mapping
- **12.5** Logo and favicon image upload → `POST admin/settings/upload-logo`, `POST admin/settings/upload-favicon`
- **12.6** Company logo/image upload → covered by logo upload endpoint above
- **13.1** Granular permission management → permissions matrix on RoleDefinition entity with toggle endpoints
- **13.2** Custom role CRUD → extended RoleDefinitions module
- **14.1** Language file-level text editing → `POST admin/languages/:id/translations`, `POST admin/languages/:id/translations/bulk`, `DELETE admin/languages/translations/:id`
- **15.1** Analytics scripts CRUD → `analytics-sections` module: `GET/POST/PATCH/DELETE admin/analytics-sections`
- **16.1** Offer image upload → `PATCH admin/offers/:id/image`, `POST admin/offers/:id/upload-image`
- **16.2** Offer Excel export → `GET admin/offers/export/excel`
- **16.3** Promotion banner full fields → `subtitle`, `description`, `badgeText`, `badgeColor`, `startDate`, `endDate`, `sortOrder` all on PromotionBanner entity
- **17.1** KDS view in staff dashboard → `getStaffDashboardWithKds` with kitchen orders
- **17.2** Today's analytics in staff dashboard → `todayStats` in staff dashboard response
- **18.1** Customer dietary/cuisine preferences → `PATCH/GET profile/preferences`
- **18.2** AI chatbot with order intelligence → `ChatbotService` handles order tracking, loyalty stamps, recommendations, wait time
- **18.3** Loyalty redemption via chatbot → chatbot `redeem` intent calls `handleRedemption(userId)` and marks the reward as redeemed
- **18.4** Customer loyalty segments view → `GET loyalty/segments`
- **19.1** LoyaltyConfiguration CRUD → `GET/PATCH/DELETE admin/loyalty/configurations/:id` (POST already existed)
- **19.2** Auto-reset stamps setting → `autoResetStamps` field on LoyaltyProgram entity, used in `earnStamps()`
- **20.1** Web-based installer wizard → `GET /installer` (HTML wizard), `POST /installer/check-requirements`, `POST /installer/setup-database`, `POST /installer/create-admin`, `POST /installer/finalize`
- **21.1** Tenant management → `TenantsModule`: `GET/POST/PATCH/DELETE super-admin/tenants`, suspend/activate/assign-plan endpoints
- **21.2** Subscription plan management → `SaasPlan` entity with monthly/yearly pricing, feature limits; `GET/POST/PATCH/DELETE super-admin/plans`
- **21.3** Per-tenant isolation → `TenantMiddleware` reads `X-Tenant-ID` header and attaches `tenantId` to request context; `SUPER_ADMIN` role added to UserRole enum
- **21.4** Super-admin SaaS dashboard → `GET super-admin/dashboard` (MRR, tenant counts, recent tenants, plan breakdown)
- **22.1** Firebase push notification configuration → `GET/POST admin/settings/firebase`
- **22.2** Notification alert configuration → `NotificationAlertsController` with full CRUD
- **22.3** In-app notification inbox → `InboxController` with read/unread/delete + admin send
- **23.1** Country code API → `GET country-codes`
- **24.1** Dining table export to Excel → `GET admin/dining-tables/export/excel`
- **24.2** Branch export to Excel → `GET admin/branches/export/excel`
- **24.3** Transaction export to Excel → `GET admin/transactions/export/excel`
- **25.1** Branch-scoped message threads with read receipts → `MessagingService`: `getOrCreateThread`, `getThreadsForBranch`, `sendMessage`, `markRead`

*Last updated: 2026-06-18*
