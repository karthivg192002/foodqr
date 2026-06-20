# FoodQR — Missing Features

**Last Updated:** 2026-06-20
**OLD codebase:** `E:\poc\personal\foodqrweb` (Laravel/PHP)
**NEW codebase:** `E:\poc\personal\foodqr` (NestJS + Angular)

---

## Multi-Tenant SaaS Management — Database-per-Tenant

NEW is currently single-tenant. This section lists the work to turn it into a multi-tenant SaaS platform
where **each tenant has its own isolated database**, all tenants are reachable through **one single domain/URL**,
and the tenant is resolved transparently after login.

### Target Architecture

- **One control/master DB** — holds the tenant registry, subscription plans, billing/subscription status,
  and per-tenant DB connection metadata (host, db name, credentials reference). This is the only DB the
  platform knows about before a tenant is resolved.
- **One DB per tenant** — holds that tenant's own data (menus, orders, customers, staff, etc.) using the
  existing FoodQR schema. Fully isolated from other tenants.
- **Single public URL** — all clients (customers, staff, tenant admins) log in through the same domain.
  There is no per-tenant subdomain/path requirement in this flow — tenant identity is resolved from the
  login credentials, not from the URL.
- **Super-admin UI** — a separate management UI (distinct from the per-tenant admin UI) for the platform
  owner to manage tenants, subscriptions, plans, and tenant DB provisioning.
- **Tenant admin UI** — within a resolved tenant's own admin panel, the tenant admin can trigger/track DB
  migrations for their own tenant database (schema upgrades as the platform evolves).

### Task List

**1. Control/Master Database**
- [ ] Design master DB schema: `tenants` (id, name, slug, status, created_at), `tenant_databases`
      (tenant_id, db_host, db_name, db_user/secret ref, db_status), `subscription_plans` (name, price,
      limits/features), `tenant_subscriptions` (tenant_id, plan_id, status, started_at, renews_at,
      cancelled_at), `tenant_admins` (login identity → tenant_id mapping, used for tenant resolution).
- [ ] Set up a dedicated NestJS connection/module for the master DB, separate from the per-tenant
      TypeORM connection(s).
- [ ] Build master-DB migrations and seeders (plans, initial super-admin user).

**2. Tenant Resolution at Login**
- [ ] Add a tenant-resolution step to the auth flow: user submits credentials at the single public login
      URL → look up the user's `tenant_id` in the master DB (via `tenant_admins` / a global user-to-tenant
      index) → resolve which tenant DB to use *before* validating the password against that tenant's data.
- [ ] Decide and implement the lookup key for resolution (e.g. email is globally unique across the
      platform in the master DB, or tenant slug entered alongside credentials) — needs a product decision,
      not just code.
- [ ] Issue a JWT (or extend the existing one) that embeds the resolved `tenant_id` so that all subsequent
      requests in that session know which tenant DB to use without re-resolving on every call.

**3. Dynamic Per-Tenant DB Connection (Backend)**
- [ ] Replace the current single static TypeORM connection with a per-request/per-tenant connection
      resolver: given `tenant_id` from the authenticated request, look up that tenant's DB credentials in
      the master DB and obtain (or create/cache) a TypeORM `DataSource` for it.
- [ ] Add connection pooling/caching so each tenant DB connection isn't re-established on every request
      (e.g. an in-memory map of `tenant_id → DataSource`, with idle-connection eviction).
- [ ] Audit every existing service/repository in the codebase that currently assumes a single global
      connection, and route them through the tenant-scoped connection instead. This touches most of the
      existing modules (orders, menu, users, etc.) — significant refactor, not additive work.
- [ ] Make sure background jobs / cron tasks (if any) are tenant-aware or run per-tenant in a loop, since
      they can no longer assume one global DB.

**4. Tenant Provisioning (DB Creation + Migration)**
- [ ] Build a provisioning service that, given a new tenant record in the master DB, creates a new
      physical database, runs the full existing schema migration set against it, and seeds it with the
      same defaults a fresh single-tenant install gets today (default roles, nav menus, settings).
- [ ] Record provisioning status on the tenant record (`pending` → `provisioning` → `active` / `failed`)
      so the super-admin UI can show progress and retry failures.
- [ ] Build a per-tenant migration runner so that when the platform ships a new schema migration, it can
      be applied to one tenant, a batch of tenants, or all tenants — and the **tenant admin** (not just the
      super-admin) can trigger/track migration runs for their own tenant DB from their own admin UI.
- [ ] Define a rollback/backup strategy before running migrations against live tenant data (at minimum:
      snapshot or backup step before each migration batch).

**5. Super-Admin UI (separate from tenant admin UI)**
- [ ] New frontend area (e.g. `/superadmin/...`) restricted to a platform-owner role, entirely separate
      from the existing `/admin/...` tenant UI.
- [ ] Tenant list/detail screens: create tenant, view provisioning status, suspend/reactivate tenant,
      view which DB it's on.
- [ ] Subscription/plan management screens: define plans, assign/change a tenant's plan, view
      subscription status and renewal/cancellation.
- [ ] Tenant DB management screen: trigger provisioning, view DB health, trigger/monitor migrations
      across tenants.
- [ ] Billing integration (if subscriptions are paid) — out of scope to spec in detail here; needs its own
      design pass once a payment provider is chosen for platform-level billing (distinct from the
      per-tenant payment-gateway settings that already exist for customer orders).

**6. Tenant Admin UI additions**
- [ ] Add a "Database & Migrations" settings screen inside the existing tenant `/admin/settings` area,
      visible only to that tenant's admin, showing their own DB's current schema version and a button to
      run pending migrations against their own tenant DB.
- [ ] Surface the tenant's current subscription plan/status (read-only, sourced from the master DB) inside
      the tenant admin UI, since plan limits (e.g. number of branches, staff seats) will need to be
      enforced somewhere in the tenant app.

**7. Cross-Cutting Concerns**
- [ ] Decide and enforce plan-based feature/usage limits (e.g. max branches, max staff) — needs the tenant
      app to check master-DB subscription data before allowing certain actions.
- [ ] Security review of tenant isolation: confirm there is no code path where a resolved tenant's
      connection could leak into another tenant's request (critical given each tenant has its own DB credentials).
- [ ] Decide what happens to a tenant's data/DB on subscription cancellation or non-renewal (retain
      read-only, archive, or delete after a grace period) — product decision needed before building it.

This is a large, foundational change (new master DB, dynamic connection layer touching nearly every
existing backend module, two new frontend areas, and several unresolved product decisions). It should be
scoped and sequenced as its own project rather than folded into incremental feature work.
