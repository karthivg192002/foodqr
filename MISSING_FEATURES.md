# FoodQR — Remaining Gaps & TODO List
**Old stack:** Laravel + MySQL (`C:\IUCS\Product\GitHub\foodqrweb`)  
**New stack:** NestJS + PostgreSQL + Angular 17  
**Analysis date:** 2026-06-12  **Last updated:** 2026-06-13  
**Legend:** ⬜ TODO · 🔴 CRITICAL · HIGH · MEDIUM · LOW

> All completed items removed. This file tracks only remaining work.

---

## SECTION A — BACKEND (NestJS) GAPS

### A1. Missing Modules / Entities

| # | Feature | Old Model(s) | Priority | Notes |
|---|---------|-------------|----------|-------|
| A1.2 | **Device Token Storage** | `TokenStoreService`, `device_tokens` | HIGH | Store FCM/web-push tokens per user/device. POST `/api/frontend/device-token` |
| A1.5 | **Promotion Banner** | `PromotionBanner`, `promotion_banners` | MEDIUM | Separate from regular banners. Used in frontend home page |
| A1.6 | **Menu / Menu Section** | `Menu`, `MenuSection`, `MenuTemplate` | MEDIUM | Grouping items into menus/sections for QR display |
| A1.7 | **Analytics Sections** | `Analytic`, `AnalyticSection` | LOW | Custom KPI widget configuration for dashboard |

---

### A2. Missing Business Logic / Services

| # | Feature | Notes | Priority |
|---|---------|-------|----------|
| A2.1 | **SMS sending** | Integrate Twilio via `twilio` npm. Config from `app_settings.sms` group. Send on: OTP, order status change | HIGH |
| A2.2 | **Firebase push notifications** | Wire `firebase-admin` SDK (already installed). `FirebaseService.send(token, title, body, data)`. Use device tokens | HIGH |
| A2.3 | **Category hierarchy sub-cat filtering** | Items filtered by `parentCategoryId` in frontend API. POS also needs sub-cat browse | HIGH |
| A2.4 | **Default branch per user** | `default_access` table: user_id → branch_id. Staff/admin scoped to branch | MEDIUM |
| A2.5 | **Multi-currency support** | Exchange rate storage + price conversion for display | LOW |

---

### A3. Missing Auth / Access Control

| # | Feature | Notes | Priority |
|---|---------|-------|----------|
| A3.1 | **Fine-grained Role/Permission system** | Old: Spatie RBAC. New: hardcoded role enums. Missing: `/admin/roles`, `/admin/permissions` CRUD | MEDIUM |

---

### A4. Missing Dashboard Metrics

| # | Metric | Notes | Priority |
|---|--------|-------|----------|
| A4.1 | **Orders by status breakdown** | Count per status for date range on dashboard | MEDIUM |
| A4.2 | **Total discount given** | Sum of discounts applied in period | LOW |
| A4.3 | **Loyalty stamps issued** | Total stamps awarded in period | LOW |

---

## SECTION B — FRONTEND (Angular) GAPS

### B1. Customer-Facing Frontend Features

| # | Feature | Notes | Priority |
|---|---------|-------|----------|
| B1.1 | **Forgot Password deep link** | `forgot-password.component` exists (email form). `reset-password.component` created. Email link points to `/auth/reset-password?token=XXX`. Verify mail template uses correct frontend URL | MEDIUM |
| B1.2 | **Customer Dashboard** | Loyalty points balance, stamp card visual, recent orders, credit/wallet balance | HIGH |
| B1.3 | **Loyalty Redemption UI** | Customer sees "Redeem reward" button when stamps ≥ required. Calls `/loyalty/redeem` | HIGH |
| B1.4 | **Guest checkout flow** | Browse and order without account. OTP phone verification for guests | HIGH |
| B1.5 | **Order tracking page** | Customer views real-time order status. `GET /frontend/orders/:id/status` with status timeline | HIGH |
| B1.6 | **Category hierarchy display** | Show sub-categories under parent on menu/item listing. Currently flat category list | HIGH |

---

### B2. Admin Frontend Features

| # | Feature | Notes | Priority |
|---|---------|-------|----------|
| B2.1 | **Promotion Banners page** | Separate from regular banners. CRUD for `promotion_banners`. Admin nav entry needed | MEDIUM |
| B2.2 | **Menu / Menu Section management** | Create menus, add sections, assign items to sections for QR display | MEDIUM |
| ~~B2.3~~ | ~~QR Code display on dining tables~~ | Already implemented in dining-tables.component.html | ~~MEDIUM~~ |
| B2.4 | **Role & Permission management UI** | `/admin/roles` + `/admin/permissions` CRUD — create roles, assign permissions | MEDIUM |
| B2.5 | **Waiter assignment to dining tables** | Dropdown to assign waiter when creating/editing a table | LOW |
| B2.6 | **Analytics sections configuration** | Admin configures KPI widgets for dashboard | LOW |
| B2.7 | **Customer loyalty tier badge** | In customer list, show loyalty tier (bronze/silver/gold) badge | LOW |

---

### B3. Table Ordering (QR Dine-in) Frontend

| # | Feature | Notes | Priority |
|---|---------|-------|----------|
| B3.1 | **Table ordering app** (`/table/:tableId`)  | Customer scans QR → landing on table menu → browse → order. Separate from main customer app | HIGH |
| B3.2 | **Table order status screen** | Kitchen/staff view of all table orders. `/oss` route exists but data integration needs review | MEDIUM |

---

## SECTION C — INTEGRATION GAPS

| # | Feature | Old Equivalent | Priority | Notes |
|---|---------|---------------|----------|-------|
| C1 | **Firebase Admin SDK** | `FirebaseService` | HIGH | Wire `firebase-admin` (already installed). Send push to device tokens. Config: `FIREBASE_SERVER_KEY` |
| C2 | **SMS sending** | `SmsManagerService` + 8 gateways | HIGH | Integrate Twilio via `twilio` npm. Config from `app_settings.sms` group |
| C3 | **Excel / PDF generation** | `maatwebsite/excel` + DOMPDF | MEDIUM | Use `exceljs` for xlsx, `pdfkit` for PDF. For report exports (CSV is done, xlsx/pdf pending) |
| C4 | **Real-time order updates** | Laravel Broadcasting (Pusher/Echo) | LOW | WebSocket for KDS / OSS live updates. Consider Socket.io or SSE |

---

## SECTION D — DEFERRED / ARCHITECTURAL DECISIONS

| # | Feature | Consideration |
|---|---------|--------------|
| D1 | Multi-language (i18n) | Needs ngx-translate + backend key-value translations table |
| D2 | Multi-currency display | Exchange rate API or manual entry + price conversion layer |
| D3 | Subscription / recurring orders | Not in old system |
| D4 | Delivery zone geofencing | Would require Maps API |
| D5 | Real-time WebSocket KDS/OSS | Old uses polling; new could use Socket.io |

---

## COMPLETED (removed from active tracking)

The following were completed as of 2026-06-13:
- OTP send/verify endpoints (already in auth.service.ts)
- Mail service (nodemailer) — `mail.service.ts` + `mail.module.ts`
- Auth: guest signup, account delete, POS customer create
- Loyalty: configuration entities, reward entities, segmentation endpoints, leaderboard
- CSV exports: sales, items, credit-balance, customers
- QR code generation (dining-tables service)
- Dynamic payment gateways endpoint
- All missing Item fields (nutritional, itemType, isFeatured)
- ItemCategory parentCategoryId + children relation
- DiningTable waiterId, Order source, OrderStatus RETURNED
- **Register: 3-step OTP signup flow** (register.component.ts/html)
- **Customer cart: delivery address selection + dynamic payment gateways + coupon code**
- **Loyalty admin: Configurations tab + Segments tab + leaderboard**
- **Reports: CSV export buttons** (sales, items, credit-balance)
- **POS: Quick customer create** modal + customer badge display
- **Menu Items: Sub-category selector** when parent category has children

---

*Last analysis: 2026-06-12 against `C:\IUCS\Product\GitHub\foodqrweb` (Laravel codebase)*
