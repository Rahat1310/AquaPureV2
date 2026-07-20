# Walkthrough visuals — Customer Portal & Admin Dashboard

## Image 3 (client-facing)

Primary: [`Image-3-admin-dashboard.png`](./Image-3-admin-dashboard.png) — SUPER_ADMIN overview with full nav (Products, Orders, Service Requests, Quotes, Users, Audit Log).

Supporting role views:

| File | Role | Shows |
|------|------|--------|
| `Image-3b-admin-products.png` | SUPER_ADMIN | Products table, search/filter, CRUD, bulk select |
| `Image-3c-service-kanban.png` | SERVICE_MANAGER | Narrow nav + service request kanban |
| `01-customer-portal-overview.png` | CUSTOMER | Account portal shell |
| `09-support-orders.png` | SUPPORT | Orders access (no Products/Users/Audit) |

## RBAC verification

Run: `npx playwright test tests/rbac-portal-admin.spec.ts`

Seeded staff:

| Email | Password | Role |
|-------|----------|------|
| superadmin@aquapure.com.bd | SuperAdmin@123 | SUPER_ADMIN |
| admin@aquapure.com.bd | Admin@123456 | ADMIN |
| service@aquapure.com.bd | Service@123456 | SERVICE_MANAGER |
| support@aquapure.com.bd | Support@123456 | SUPPORT |
| rahela@example.com | Customer@123 | CUSTOMER |
