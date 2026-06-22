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

`design/` holds four high-fidelity mockups (`home_qr_menu`, `full_menu`, `item_details`, `your_order` —
each a `code.html` + `screen.png`) plus a `premium_fast_casual_digital_menu/DESIGN.md` design-system spec.
This is a **different visual language** from the current customer app
(`foodqr-frontend/src/app/features/customer/`) — not a tweak, a redesign. Current app: Inter font,
hand-drawn SVG icons, orange/white card UI, light bottom nav. Target design: Material Symbols icon font,
Plus Jakarta Sans + Work Sans, a full Material-3-style color token set (`primary` `#a73a00`/`#ff5c00`,
dark `#121212` surfaces for nav/cart bars, `rounded-2xl` cards, ambient-shadow elevation), QR
table-context header (`Table 12` + location pin instead of a logo), and several screens/components that
don't exist yet.

### 1. Design tokens & theme foundation
- [ ] Add the mockups' full color token set to `tailwind.config.js` (or as CSS variables) — `primary`,
      `primary-container`, `secondary`, `surface` / `surface-container[-low|-high|-highest|-lowest]`,
      `on-*` text-on-color pairs, `outline`/`outline-variant`, `error` — as specified in
      `design/premium_fast_casual_digital_menu/DESIGN.md`. Current `tailwind.config.js` only has a generic
      `primary` orange ramp and `surface.DEFAULT/raised/overlay` — not this token system.
- [ ] Load **Plus Jakarta Sans** (headlines/prices: 800/700 weight) and **Work Sans** (body/labels:
      400/600) from Google Fonts; current app is Inter-only (`tailwind.config.js` `fontFamily.sans`).
- [ ] Add the **Material Symbols Outlined** icon font (used everywhere in the mockups —
      `location_on`, `shopping_bag`, `search`, `add`, `remove`, `lunch_dining`, `local_pizza`, `eco`,
      `local_bar`, `icecream`, `restaurant_menu`, `receipt_long`, `arrow_back`, `check_circle`,
      `credit_card`, `apps`, `google`). Decide: swap wholesale for Material Symbols, or keep the existing
      hand-drawn SVG icon set and re-skin colors/sizes to match — current customer layout
      (`customer-layout.component.html`) inlines its own SVG `<ng-template #iconTpl>`.
- [ ] Define the elevation/shadow scale from the spec (Level 1 background, Level 2 cards
      `0px 4px 20px rgba(0,0,0,0.1)`, Level 3 modals `0px 10px 30px rgba(0,0,0,0.15)` + 20px backdrop blur)
      as reusable Tailwind shadow utilities, replacing the ad-hoc inline `style="box-shadow:..."` used today.
- [ ] Decide replacement for the current orange/white gradient page background
      (`customer-layout.component.html` line 1: `linear-gradient(180deg,#fff7ed...)`) — the new design uses
      a flat `#fbf9f9` background with no gradient.

### 2. Navigation shell (header + bottom nav + sidebar)
- [ ] Redesign the mobile **top app bar**: location-pin + table number on the left (`Table 12`) instead of
      the current logo, single cart icon on the right — no search/cart-count badge in the header itself on
      the home screen (search moves into the hero section; cart count lives in the floating order bar
      instead). See all four mockups' `<header>`.
- [ ] Redesign the mobile **bottom nav bar** to the dark `#121212`-style pill bar with a filled pill
      "active" indicator (mockups use `bg-primary-container text-on-primary-container rounded-full` on the
      active item) — current bottom nav (`customer-layout.component.html`) is a light/white bar with a
      raised center "Scan" FAB button that has no equivalent in the new design (new design's nav is
      Home/Menu/Search/Orders, 4 flat items, no elevated center action).
- [ ] Add a persistent **floating "View Cart" bar** above the bottom nav whenever the cart is non-empty
      (dark pill, item count chip + "View Cart" label + total price) — see `home_qr_menu` and `full_menu`
      mockups. This doesn't exist in the current layout (`customer-layout.component.html` only has a small
      cart icon + badge in the header).
- [ ] Decide how the desktop **sidebar** (just added — `customer-layout.component.html`) should be
      restyled to match the new token set (dark `#121212`/charcoal vs. the current white sidebar with
      orange accents), or whether desktop keeps its own treatment while mobile follows the mockups exactly.

### 3. Home screen (`design/home_qr_menu`)
- [ ] Greeting hero ("Good Morning, *Hungry?*" — time-of-day-aware greeting + accent-colored second line)
      and integrated search bar, replacing whatever currently sits at the top of
      `customer-home.component.html`.
- [ ] Horizontally-scrolling **category chips** with icon-in-circle + label (Burgers/Pizza/Salads/Drinks/
      Desserts), active state = dark filled circle. Current home page's category filter UI needs a side-by-
      side comparison and likely a rebuild to this chip style.
- [ ] **Special offers banner** — full-bleed image card with gradient overlay, "Limited Time" badge, title +
      subtitle (e.g. "50% Off Shakes"). Check whether `Offer`/`Banner` data models already support this or
      need new fields (badge text already exists per `core/models/index.ts` `Offer.badgeText`).
- [ ] **"Recommended for You"** horizontal-scroll product cards (image top, name, 1-line description, price
      bottom-left, circular "+" add button bottom-right with a tap micro-interaction that flips to a
      checkmark) — reusable `ProductCard` component candidate, since the same card recurs across screens.
- [ ] **"Popular Choices" bento grid** — 2-column grid of image tiles with gradient-bottom text overlay,
      last tile spanning both columns. New layout pattern, not present today.

### 4. Full menu screen (`design/full_menu`)
- [ ] Sticky **category tabs** bar (pill buttons, scrolls horizontally, sticks under the header on scroll)
      replacing/restyling the current category filter on the menu listing.
- [ ] **Alternating image-left/image-right list cards** per item (square thumbnail, name, 2-line
      description, price, circular add button) grouped under section headings (e.g. "Signature Burgers").
      Different from the home screen's vertical product card — needs its own list-row component.
- [ ] Reuse the floating "View Cart" bar + bottom nav from section 2 here as well.

### 5. Item details screen (`design/item_details`)
- [ ] This is a **new full-page item detail view** (not a modal) — large hero image (4:3 mobile /
      21:9 desktop) with a gradient fade, a card that overlaps the hero (`-mt-8` negative margin) containing
      name + price, description, and an **ingredients chip list**. Need to confirm whether the current
      customer app has any per-item detail route at all, or only inline expansion.
- [ ] **Customization options** section: checkbox rows for add-ons (e.g. "Extra Cheese +$1.50") and radio
      rows for mutually-exclusive choices (e.g. bun type) — maps to existing `ItemExtra`/`ItemVariation`
      models on the backend, needs a matching frontend customization form.
- [ ] **Special requests** free-text textarea (per-item note) — check whether `CartItem.specialNote`
      (already in `core/models/index.ts`) is exposed in any UI today.
- [ ] Bottom action bar: pill quantity stepper (−/qty/+) + full-width "Add to Cart" button showing the
      line total (e.g. "Add to Cart · $34.50") — distinct component from the cart-page stepper in section 6.

### 6. Cart / checkout screen (`design/your_order`)
- [ ] "Your Selection" cart list — same image-left row pattern as section 4, but with an inline qty stepper
      per row instead of an add button.
- [ ] **Kitchen Note** — order-level free-text field (separate from per-item special requests in section 5).
- [ ] **Payment method selector** — Apple Pay / Google Pay / Credit Card as selectable rows with a filled
      "selected" state (dark row + check-circle) vs. unselected (outlined radio). Need to confirm which of
      these are real payment options vs. illustrative — cross-reference with `PaymentGatewaysModule`'s
      actually-enabled gateways rather than hardcoding Apple/Google Pay.
- [ ] **Bill summary** block — Subtotal / Tax / Service Charge / Total, with Total visually emphasized.
      Check this matches the actual tax/service-charge calculation already done server-side
      (`CurrencyModule`/`TaxModule`) rather than just being a static mock.
- [ ] Full-width pill **"Place Order"** button showing the total inline (e.g. "Place Order · $26.46").

### 7. Cross-cutting
- [ ] Build a shared `ProductCard` / `ProductListRow` / `CategoryChip` / `QuantityStepper` /
      `FloatingCartBar` component set under `customer/` (or `shared/`) so the four screens stop duplicating
      markup — the mockups reuse the same few primitives repeatedly.
- [ ] Confirm image strategy: mockups use hosted placeholder URLs (`lh3.googleusercontent.com/...`) with
      descriptive `data-alt` text — real implementation needs to wire these to `Item.thumbImage`/
      `coverImage`/`gallery` from the backend instead.
- [ ] This is a visual + structural overhaul of every customer-facing screen — should be scoped as its own
      design-implementation pass (likely screen-by-screen) rather than a single sweeping change, given four
      screens × new components × a full token/theme migration.
