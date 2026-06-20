# FoodQR — Missing Features

**Analysis Date:** 2026-06-17
**Last Updated:** 2026-06-20 (re-audited nav/menu parity per role against OLD codebase)
**OLD codebase:** `E:\poc\personal\foodqrweb` (Laravel/PHP)
**NEW codebase:** `E:\poc\personal\foodqr` (NestJS + Angular)

> Items marked ✅ have been implemented in the new codebase and removed from the gap list.

---

## UI Layout Fix (2026-06-20)

Customer-facing layouts (`customer-layout.component.ts`, `table-layout.component.ts`) were hard-capped at
`max-w-lg` (512px) on every breakpoint, so on desktop the whole app rendered as a narrow centered column
with large empty margins, even though the page content underneath (e.g. customer-home's item grid) was
already responsive. Fixed by widening the header/main/nav containers to `max-w-7xl` and adding a desktop
top-nav (Home/Orders/Rewards/Profile) since the mobile bottom tab bar is now hidden at `lg:` breakpoints.
Admin/Waiter/Chef/Staff dashboards already used a full-screen sidebar layout (`admin-layout.component.ts`)
and needed no change.

---

## Role Menu Parity Gaps (re-opened 2026-06-20)

Role mapping OLD → NEW: Admin, Customer, Waiter, Chef, Branch Manager, POS Operator, Staff — all carried
over 1:1. Comparison based on OLD `MenuTableSeeder.php`, `routes/api.php`, and the Vue nav components
(`BackendMenuComponent.vue`, `CustomerSidebar.vue`, `StaffDashboardComponent.vue`) vs the NEW Angular nav
(`admin-layout.component.ts`, `customer-layout.component.ts`).

- [ ] **Customer — Scan & Order**: OLD customer sidebar has a dedicated "Scan & Order" entry; no equivalent route under `/customer/` in NEW (table/QR ordering exists at `/table/...` but isn't reachable from the customer nav).
- [ ] **Admin — Role & Permission management**: OLD `/admin/setting/role` and `/admin/setting/permission` UIs have no NEW nav entry (a `roles-permissions` folder exists in the Angular tree but isn't linked in `admin-layout.component.ts`'s nav groups — verify and wire it up).
- [ ] **Admin — Language management**: OLD `/admin/setting/language`; no equivalent in NEW.
- [ ] **Admin — SMS Gateway / Mail / Site / Company / Theme / License / OTP settings**: OLD exposes these as distinct settings sub-pages; NEW collapses everything under a single `/admin/settings` with unclear sub-page coverage — needs verification of what `admin/settings` actually renders.
- [ ] **Admin — Menu Sections & Menu Templates**: OLD `/admin/setting/menu-section`, `/admin/setting/menu-template`; no NEW equivalent under `/admin/menu/*`.
- [ ] **Admin — Category Attributes** (distinct from Item Attributes) and **Item Addons** (distinct from Item Extras): OLD treats these as separate concepts; NEW only has Categories/Items/Extras/Attributes.
- [ ] **Admin — Table Orders view**: OLD has a dedicated table-orders management screen distinct from general Live Orders; not clearly present in NEW.
- [ ] **Admin — Offers vs Banners**: NEW merges "Offers & Banners" into one nav item; confirm both OLD feature sets (separate `/admin/offers` and `/admin/banners`) are actually reachable, not just the offers half.
- [ ] **Admin — Loyalty Configurations**: OLD has `/admin/loyalty-configurations` as a distinct screen from the loyalty program itself; confirm NEW's single "Loyalty Program" nav item covers configuration, not just point rules.
- [ ] **Reports — Items Report / Credit Balance Report**: OLD exposes 3 separate report types; NEW has one generic "Reports" nav item — confirm sub-reports are reachable from within it.
- [ ] **Per-user admin actions**: OLD per-user (customer/employee/waiter/chef/admin) management includes change-password, change-image, address management, and "my orders" sub-views; unclear whether these exist in NEW's `/admin/staff`, `/admin/customers`, `/admin/administrators` detail views — needs direct UI check, not just nav-item check.
- [ ] **Staff/Waiter/Chef dashboard — Analytics tab**: OLD `StaffDashboardComponent.vue` has an Analytics view (efficiency score, avg order time, customer rating, completed count). NEW `/admin/staff-dashboard` needs to be checked for this.
- [ ] **Platform/tenant admin**: OLD has multi-tenant SaaS management (`tenant-management`, `superadmin/subscription` routes) — if FoodQR NEW is still meant to be multi-tenant, this entire area has no frontend yet (may be intentionally out of scope if NEW is single-tenant by design — confirm with product intent before treating as a gap).

Most of the above are nav/discoverability gaps rather than confirmed missing backend functionality — several may already exist server-side or behind an unlinked route. Each item should be spot-checked in the running app before being scheduled as build work.

---

*Previous session (2026-06-18) closed out all gaps known at that time; this update reflects a fresh, more granular pass over per-role navigation menus and is not a regression.*
