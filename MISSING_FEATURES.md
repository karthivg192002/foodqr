# FoodQR — Missing Features

**Last Updated:** 2026-06-24
**OLD codebase:** `E:\poc\personal\foodqrweb` (Laravel/PHP)
**NEW codebase:** `E:\poc\personal\foodqr` (NestJS + Angular)

---

## Multi-Tenant SaaS Management — Database-per-Tenant

Phase 1 (row-level isolation) and Phase 2 (real per-tenant physical databases, dynamic connection
resolver, provisioning, schema-sync migrations, billing) are both done — see git history /
`tenants` module for how tenant resolution, `TenantConnectionService`, `tenantAwareRepo()`, and billing
work.

All ~34 remaining services (Reports, Settings, Currency/Tax, Service Charge, Offers, Messaging/Chatbot,
Analytics, Item Attributes/Add-ons, Time Slots, Notifications/Push, Menu Sections/Templates, Role
Definitions, KDS/OSS, Addresses, Delivery Zones, Languages, Default Access, Notification Alerts,
Newsletter, Pages, Users, Payments/Payment Gateways, SMS Gateways, Subscriptions, License, Mail, Nav
Menus, Loyalty Settings) are now converted to `tenantAwareRepo()`, so a physical-DB tenant gets a fully
working admin panel, not just the core ordering flow. Master-DB-only entities (`Tenant`, `SaasPlan`,
`TenantUserIndex`, `TenantInvoice`) were intentionally left unwrapped.

`tenant-provisioning.service.ts`'s `runMigration()` now snapshots the tenant DB
(`CREATE DATABASE ..._bak_<timestamp> TEMPLATE ...`) before every schema sync, returning the backup name in
the response — cheap Postgres-native copy, no extra tooling, but only safe because it runs standalone
(never concurrently with a live request against the same tenant DB).

`branches.service.ts create()` and `users.service.ts createUser()` now enforce `SaasPlan.maxBranches`/
`maxStaff` (`<= 0` = unlimited), throwing `BadRequestException` once a tenant is at its plan's cap.
Customers don't count against the staff limit, only operational roles.

Tenant isolation was reviewed: `TenantContextMiddleware` + `AsyncLocalStorage` (`tenant-context.ts`)
correctly scope the resolved DataSource per-request — no shared-mutable-state leak across concurrent
requests was found. One real bug was found and fixed: `TenantConnectionService.getOrCreate()` had a
cache-stampede gap where concurrent first-requests for the same tenant could both call `initialize()`,
orphaning a connection — now de-duped via an in-flight-promise map.

What's left / intentional decisions:
- [ ] **Per-tenant DB credentials — not planned.** Per explicit decision, every tenant DB keeps using the
      single shared Postgres user/password from `.env` (`DB_USERNAME`/`DB_PASSWORD`); only the database
      *name* varies per tenant. True per-tenant credential isolation (separate DB role per tenant) was
      considered and intentionally rejected as unnecessary infra risk for this deployment model.
- [ ] **Background jobs/cron — not applicable yet.** Confirmed via codebase search that no cron/scheduled
      job infrastructure exists today (no `@nestjs/schedule`, no `@Cron`, no `setInterval` job runners).
      Nothing to convert to a "run this for every tenant" pattern until an actual background job is added —
      building that abstraction speculatively was deliberately skipped.
- [ ] **Security review is a point-in-time check**, not a recurring process — re-audit if the tenant
      resolution/connection-caching code changes again.

---

## Customer Dashboard Design

`design/` mockups (`home_qr_menu`, `full_menu`, `item_details`, `your_order` +
`premium_fast_casual_digital_menu/DESIGN.md`) have been implemented across the customer app
(`foodqr-frontend/src/app/features/customer/`): `cust-*` color tokens + Plus Jakarta Sans/Work Sans +
Material Symbols Outlined added to `tailwind.config.js`/`index.html`; the layout shell (dark pill bottom
nav, floating "View Cart" bar, dark desktop sidebar, table/location-style header) was rebuilt; the home
page now matches the greeting-hero/category-chips/offers-banner/recommended-carousel/bento-grid layout; a
new full-menu page (`customer/menu`) has sticky category tabs and alternating image rows; a new item
details page (`customer/item/:id`) has the hero, ingredients chips, extras/variations customization, and
quantity stepper; the cart/checkout page has the kitchen note, gateway-driven payment selector (reads
`payment-gateways/active`, no hardcoded Apple/Google Pay), and a real tax line (`frontend/taxes`) in the
bill summary.

The redesign above only ever covered the **logged-in account flow** (`features/customer/`). The actual
QR-scan flow real customers use (`features/table/`) was still the original unstyled scaffold — no desktop
sidebar, no `lg:` breakpoints — which is why the menu looked broken/empty on desktop. That's now fixed:
`table-layout.component.ts` has a real desktop sidebar (Menu/Cart nav), and `table-menu`/`table-cart`/
`table-track`/`table-scan` got `lg:` breakpoint treatment (2-col item grid, max-width container, sticky
category tabs) on top of their existing orange visual language — not reskinned to the dark `cust-*` tokens,
to avoid an unverified cross-theme change in the live paying QR flow.

Branch-scoped menus were added: `Item`/`ItemCategory` now have a nullable `branchId`
(`branchId IS NULL` = visible at every branch, preserving today's behavior for untagged items). The
scanned table's branch filters `frontend/categories`/`frontend/items` in the table flow
(`CartService.branchId`, set in `table-scan`/`table-menu`) and flows into the placed order
(`table-cart.component.ts`); the account-dashboard flow got a branch picker (desktop pill + mobile header)
persisted to `localStorage` via `CartService.selectBranch()`. Admin item/category forms gained a branch
selector (`admin/branches`). Existing tenant DBs need `POST admin/tenants/run-migration-all` (or a fresh
provision) to pick up the new `branchId` column — this repo uses TypeORM `synchronize: true` per-tenant,
not versioned migrations.

The four previously-tracked "Remaining gaps" are now done:
- **Shared component extraction** — `app-product-tile` (`shared/components/product-tile/`) replaced the
  duplicated product-card/list-row markup in `customer-home` ("Recommended for You") and `customer-menu`
  (alternating item rows), in `card`/`row` layout variants.
- **Service charge** — a real `service-charge` backend module (entity/service/controller/DTO) was added,
  mirroring the `tax` module exactly (`frontend/service-charges`, `admin/service-charges` CRUD + set-default,
  an admin UI tab next to Currency/Tax). `customer-cart` now shows a computed Service Charge line instead of
  a static $0.00. While doing this, found and fixed a real pre-existing bug: `CreateTaxDto` (and the new
  `CreateServiceChargeDto`, mirrored from it) had no `class-validator` decorators, so the global
  `ValidationPipe`'s `forbidNonWhitelisted: true` silently rejected every field — `admin/taxes` and
  `admin/service-charges` creation were both broken until decorators were added.
- **Live UI verification** — exercised via Playwright against the real dev servers (not just `ng build`):
  table-scan → table-menu at desktop/mobile widths, customer home/menu at desktop/mobile, and an end-to-end
  add-to-cart → cart checkout showing real Tax + Service Charge line amounts. Zero console errors across all
  pages. Screenshots confirmed the desktop sidebar, the 2-col responsive item grid, the branch picker, and
  the new "Menu" nav item all render correctly.
- **Tablet/desktop breakpoints** — `customer-home` (categories row, recommended carousel, bento grid now
  `lg:grid-cols-4`) and `customer-menu` (`lg:` 2-col item grid) got an `lg:max-w-5xl lg:mx-auto` content
  wrapper so they no longer stretch edge-to-edge on wide viewports.

Remaining gaps:
- [ ] **`table/` visual consistency with `cust-*` theme** — the table-scan flow now has working desktop
      breakpoints but still uses its original orange Tailwind classes rather than the dark `cust-*` design
      tokens used in `features/customer/`. Unifying the two is a deliberate follow-up, not done here.
- [ ] **Per-branch menu admin UX** — branch selector exists on item/category forms, but there's no bulk
      "copy menu to another branch" or branch-filtered list view in the admin panel yet.
- [ ] Tablet/desktop breakpoints were extrapolated, not pixel-matched against a design file — `design/`
      mockups are mobile-only, so the desktop treatment above is a reasonable extrapolation, not a verified
      design.

## Tenant Default Admin

Verified by reading the live code — already works, no change needed. Tenant creation provisions a default
branch + `UserRole.ADMIN` user (`tenant-provisioning.service.ts: seedDefaultBranchAndAdmin`), returns
`adminCredentials` (`email`/`tempPassword`) in the tenant-creation response, and that admin can call
`POST admin/users` to create additional users (`users.controller.ts`, `Roles(ADMIN, BRANCH_MANAGER)`).
