# FoodQR — Missing Features

**Last Updated:** 2026-06-22
**OLD codebase:** `E:\poc\personal\foodqrweb` (Laravel/PHP)
**NEW codebase:** `E:\poc\personal\foodqr` (NestJS + Angular)

---

## Multi-Tenant SaaS Management — Database-per-Tenant

Phase 1 (row-level isolation) and Phase 2 (real per-tenant physical databases, dynamic connection
resolver, provisioning, schema-sync migrations, billing) are both done — see git history /
`tenants` module for how tenant resolution, `TenantConnectionService`, `tenantAwareRepo()`, and billing
work. What's left:

- [ ] **Convert the remaining ~35 modules** to `tenantAwareRepo()` (Reports, Settings, Currency/Tax, Offers,
      Messaging, Analytics, Item Attributes/Add-ons, Time Slots, Notifications, Menu Sections/Templates,
      Role Definitions, KDS/OSS/POS read paths, etc.) so a physical-DB tenant gets a fully working admin
      panel, not just the core ordering flow. Same mechanical pattern as the already-converted modules
      (Auth, Branches, Users, Orders, Menu, Dining Tables, Loyalty) — no new architecture needed.
- [ ] **Rollback/backup strategy** before running a migration (schema sync) against live tenant data — at
      minimum, snapshot the tenant DB before each sync. `runMigration`/`runMigrationForAll` currently sync
      with no backup step.
- [ ] **Per-tenant credentials** — tenant DBs currently share the master Postgres user/password, just a
      different database name. True credential-level isolation (separate DB role per tenant) is a follow-up
      if that's a hard requirement, not just database-name isolation.
- [ ] **Plan limit enforcement** — usage vs. plan limits (max branches/staff) is displayed, but nothing
      blocks creating branch #4 on a 3-branch plan yet.
- [ ] **Security review of tenant isolation** — confirm there's no code path where `TenantContextMiddleware`
      or `tenantAwareRepo()` could leak one tenant's DataSource into another tenant's request (e.g. under
      concurrent requests sharing Node's event loop) — should be audited now that real cross-customer data
      separation is live, not just simulated.
- [ ] **Background jobs/cron** (if any are added later) need to loop per-tenant DB explicitly — there's no
      "run this for every tenant" scheduler abstraction yet, only the manual `run-migration-all` action.

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

Remaining gaps:
- [ ] **Shared component extraction** — the product card / list row / category chip markup is duplicated
      across home, menu, and item-details rather than factored into shared Angular components. Works today,
      but any visual tweak has to be made in 3 places.
- [ ] **Service charge** isn't a real backend concept anywhere in the app — the bill summary shows a static
      $0.00 line (matching the mockup) rather than a computed value. Add a real service-charge setting if
      this needs to be more than cosmetic.
- [ ] **Live UI verification** — changes were verified via `ng build` only, not exercised in a running
      browser session (login as a customer, scan/browse/add-to-cart/checkout end to end).
- [ ] Tablet/desktop breakpoints beyond the sidebar were not mocked in `design/` (mockups are mobile-only) —
      current desktop treatment is a reasonable extrapolation, not a verified design.
