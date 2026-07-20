# AquaPure V2 Project Standards & Development Skill

This document defines the strict development standards, directory architectures, coding practices, and testing requirements for the AquaPure V2 storefront application. All AI agents and developers working on this codebase MUST conform to these standards.

---

## 1. Directory Structure & Architecture

AquaPure is built on **Next.js 15+ (App Router)** and **React 19**, with data persisted in **PostgreSQL (NeonDB)** via **Prisma ORM**.

```
c:\Users\ramim\OneDrive\Desktop\AquaPure-main\
├── prisma/               # Prisma schema & seeding scripts
├── public/               # Static assets & public images
├── src/
│   ├── app/              # Next.js App Router pages & APIs
│   │   ├── (storefront)/ # Customer-facing routes (homepage, categories, products)
│   │   ├── admin/        # Super-admin & operational management panel
│   │   ├── dashboard/    # Customer-facing user dashboard
│   │   └── api/          # Internal REST APIs (NextAuth, quotes, etc.)
│   ├── components/       # Shared UI components & layouts
│   │   ├── shared/       # Cross-page generic components (ambient background, headers)
│   │   └── ui/           # Low-level shadcn components
│   ├── features/         # Domain-driven feature models, queries, and business logic
│   │   ├── catalog/      # Product and Category fetching logic
│   │   └── quote/        # Lead ingestion and quote requests
│   └── lib/              # Shared helper functions, prisma instance, and utility files
└── tests/                # Playwright end-to-end integration tests
```

---

## 2. Coding & Design Standards

### A. TypeScript & React 19
- **Strict Typing**: Never use `any`. Always define explicit prop types and interfaces.
- **Client vs Server Components**: Defaults to Server Components. Mark client-side interactivity files with `"use client"` at the very top.
- **Framer Motion Types**: When using custom variants or transitions, ensure type compliance. Explicitly type motion configurations (e.g. `ease: [0.16, 1, 0.3, 1] as [number, number, number, number]`).

### B. Styling & Premium Aesthetics
- **Rich Aesthetics**: Do not build plain, minimal MVPs. Use soft gradients, water-inspired radial blurs, shadow elevations, and glassmorphism backdrop blurs.
- **Theme Palette**: Stick strictly to the AquaPure brand colors (Deep Indigo `/primary`, Sky Blue `/secondary`, emerald greens for trust, soft blue tints for borders).
- **Responsive Layout**: Design mobile-first. Use tailwind grid/flex breakpoints (`sm:`, `md:`, `lg:`, `xl:`) to ensure layout integrity on all screen widths.

### C. High-Performance Animations
- **GPU-Accelerated**: Only animate `transform` (translates, scales, rotations) and `opacity`. Never animate properties that cause layout recalculation (like `top`, `left`, `width`, `height`, `margin`).
- **Will-Change Hinting**: Add `will-change: transform` or `will-change: opacity` where appropriate to leverage GPU acceleration on layers.
- **Reduced Motion Compliance**: Always respect system preferences. Wrap framer-motion components with `useReducedMotion()` or leverage `@media (prefers-reduced-motion: reduce)` in CSS to completely disable animations or provide static fallback layouts.

---

## 3. Database Standards (Neon Postgres & Prisma)

### A. Schema Integrity
- **Enums**: Implement enums as string fields with TypeScript-level type checks (e.g., Zod validation or string unions) instead of native database enums to avoid migration lockups.
- **Unique Fields**: Category/Product fields must preserve URL slugs. Never change underlying slug IDs (`/category/residential` or `/category/commercial`) to protect SEO bookmarks.

### B. Database Seeding & Migrations
- **Idempotency**: The seed file (`prisma/seed.ts`) must be completely runnable multiple times without throwing unique constraint or key errors.
- **Cascade Deletes**: Respect database constraints. Clear child tables (such as `AuditLog`, `OrderItem`, `Review`, `ProductVariant`) in transaction blocks before resetting core tables like `Category` and `Product`.

---

## 4. Testing & Quality Assurance

### A. Playwright Integration Tests
- **Port Override**: Tests must support overriding default base URLs via environment parameters (`process.env.BASE_URL`).
- **Standard Run Commands**:
  - Storefront tests: `$env:BASE_URL="http://localhost:3001"; npx playwright test tests/storefront.spec.ts`
  - Authentication tests: `$env:BASE_URL="http://localhost:3001"; npx playwright test tests/auth.spec.ts`

### B. Lighthouse Score Budget
- All storefront page improvements must not regress mobile performance scores.
- Maintain a minimum **90+ performance rating on mobile** through lazy loading, optimizing static assets, and minimizing Main-Thread blocking JavaScript.

# AuraPure Project Standards
- Tech Stack: Next.js 15 (App Router), TypeScript (Strict), Tailwind CSS, shadcn/ui, Prisma + PostgreSQL, Auth.js v5.
- Architecture Pattern: Feature-based folder structure (NOT type-based).
- Business Logic Rule: All validation (Zod), database writes/reads, and permission checks MUST live inside `/src/features/*/actions.ts`. Never write DB queries or business logic directly inside page components or standard UI components.
- Security Rule: Parameterize all queries via Prisma, enforce server-side RBAC on every Action, and reject unvalidated inputs.