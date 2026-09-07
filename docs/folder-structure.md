# CampusMart AI — Canonical Folder Structure

This document defines the single, canonical Next.js project structure for CampusMart AI. It is consistent with `docs/frontend.md`, `docs/pages.md`, `docs/components.md`, and `docs/routing.md`, and supersedes no other structure — this is the only folder structure to be used for the frontend. Do not create alternate or competing structures.

---

## Table of Contents

1. [Top-Level Layout](#1-top-level-layout)
2. [Full Directory Tree](#2-full-directory-tree)
3. [`app/` — Routing Layer](#3-app--routing-layer)
4. [`components/` — Reusable UI](#4-components--reusable-ui)
5. [`lib/` — Application Logic](#5-lib--application-logic)
6. [`types/` — Shared TypeScript Types](#6-types--shared-typescript-types)
7. [Root-Level Files](#7-root-level-files)
8. [Naming Conventions](#8-naming-conventions)
9. [Consistency Rules](#9-consistency-rules)

---

## 1. Top-Level Layout

The project root contains four primary source areas plus standard Next.js config files:

```
src/
  app/          → Routing, layouts, pages (Next.js App Router)
  components/   → Reusable UI components, organized by domain
  lib/          → API client, auth, validation, utilities (non-UI logic)
  types/        → Shared TypeScript type definitions
middleware.ts   → Route-level auth guard (project root)
```

Every file in the project belongs to exactly one of these areas. No file mixes routing, presentation, and business logic; each area has a single, well-defined responsibility.

---

## 2. Full Directory Tree

```
src/
  app/
    (public)/
      layout.tsx
      page.tsx                          # "/"
      login/
        page.tsx                        # "/login"
      signup/
        page.tsx                        # "/signup"
      forgot-password/
        page.tsx                        # "/forgot-password"

    (student)/
      layout.tsx
      marketplace/
        page.tsx                        # "/marketplace"
        loading.tsx
        error.tsx
        [listingId]/
          page.tsx                      # "/marketplace/[listingId]"
          loading.tsx
          error.tsx
          not-found.tsx
      sell/
        page.tsx                        # "/sell"
      listings/
        page.tsx                        # "/listings"
        loading.tsx
        error.tsx
        [listingId]/
          edit/
            page.tsx                    # "/listings/[listingId]/edit"
            loading.tsx
            error.tsx
      wishlist/
        page.tsx                        # "/wishlist"
        loading.tsx
        error.tsx
      messages/
        page.tsx                        # "/messages"
        loading.tsx
        error.tsx
        [threadId]/
          page.tsx                      # "/messages/[threadId]"
          loading.tsx
          error.tsx
          not-found.tsx
      notifications/
        page.tsx                        # "/notifications"
        loading.tsx
        error.tsx
      profile/
        page.tsx                        # "/profile"
        loading.tsx
        error.tsx
      settings/
        page.tsx                        # "/settings"
        loading.tsx
        error.tsx

    (admin)/
      admin/
        layout.tsx
        page.tsx                        # "/admin"
        loading.tsx
        error.tsx
        users/
          page.tsx                      # "/admin/users"
          loading.tsx
          error.tsx
        listings/
          page.tsx                      # "/admin/listings"
          loading.tsx
          error.tsx
        reports/
          page.tsx                      # "/admin/reports"
          loading.tsx
          error.tsx

    layout.tsx                          # root layout (AuthProvider, ToastProvider, fonts)
    globals.css
    not-found.tsx                       # global 404
    error.tsx                           # global error fallback

  components/
    ui/                                 # shadcn/ui primitives (button, input, dialog, table, skeleton, toast, etc.)

    layout/
      navbar.tsx                        # Navbar
      footer.tsx                        # Footer
      sidebar.tsx                       # Sidebar

    marketplace/
      product-card.tsx                  # ProductCard
      product-grid.tsx                  # ProductGrid
      search-bar.tsx                    # SearchBar
      filter-panel.tsx                  # FilterPanel
      category-card.tsx                 # CategoryCard
      wishlist-button.tsx               # WishlistButton
      product-image-gallery.tsx         # ProductImageGallery
      price-badge.tsx                   # PriceBadge

    listings/
      listing-form.tsx                  # ListingForm
      image-uploader.tsx                # ImageUploader

    reports/
      report-dialog.tsx                 # ReportDialog

    notifications/
      notification-card.tsx             # NotificationCard

    messages/
      thread-list.tsx                   # ThreadList
      message-thread.tsx                # MessageThread
      message-composer.tsx              # MessageComposer

    admin/
      users-table.tsx                   # UsersTable
      listings-table.tsx                # ListingsTable
      reports-table.tsx                 # ReportsTable

    feedback/
      loading-skeleton.tsx              # LoadingSkeleton
      empty-state.tsx                   # EmptyState
      error-state.tsx                   # ErrorState
      toast-provider.tsx                # Toast / ToastProvider

  lib/
    api/
      client.ts                         # typed fetch wrapper, ApiError, auth header injection
      listings.ts                       # listings API functions
      wishlist.ts                       # wishlist API functions
      profile.ts                        # profile API functions
      reports.ts                        # reports API functions
      admin.ts                          # admin API functions
      messages.ts                       # messages/threads API functions
      notifications.ts                  # notifications API functions

    auth/
      auth-context.tsx                  # AuthProvider, auth state
      use-auth.ts                       # useAuth() hook
      cognito.ts                        # client-side Cognito integration
      roles.ts                          # role constants, role-guard helpers

    validation/
      listing-schema.ts                 # ListingForm validation schema
      profile-schema.ts                 # Profile form validation schema
      report-schema.ts                  # ReportDialog validation schema
      auth-schema.ts                    # Login/Signup/Forgot Password validation schemas

    utils/
      cn.ts                             # className merge utility
      format.ts                         # price/date/text formatting helpers

  types/
    listing.ts                          # Listing, ListingFilters, listing status union
    user.ts                             # User, role union
    wishlist.ts                         # WishlistItem
    report.ts                           # Report
    notification.ts                     # Notification
    message.ts                          # Message, MessageThreadSummary
    api.ts                              # shared API request/response envelope types

middleware.ts                           # auth guard for (student) and (admin) route groups
```

---

## 3. `app/` — Routing Layer

**Purpose:** Owns all routing, page composition, and route-level states (loading, error, not-found), per `docs/routing.md`.

| Path | Purpose |
|---|---|
| `app/(public)/` | Public route group — no auth required. Own `layout.tsx` renders the minimal public shell. |
| `app/(student)/` | Student route group — auth required. Own `layout.tsx` renders `Navbar` + auth guard. |
| `app/(admin)/admin/` | Admin route group — auth + `ADMIN` role required. Own `layout.tsx` renders `Navbar` + `Sidebar` + role guard. |
| `page.tsx` | The route's page content. Server Component by default; fetches initial data via `lib/api/*` where practical. |
| `layout.tsx` | Structural chrome (nav, containers) shared across a route group or segment. No page-specific data fetching. |
| `loading.tsx` | Route-segment loading UI, rendered automatically by Next.js during navigation/data fetch; typically renders `LoadingSkeleton`. |
| `error.tsx` | Route-segment error boundary; renders `ErrorState` with retry, per `docs/pages.md`. |
| `not-found.tsx` | Route-segment or global not-found UI (e.g., invalid `listingId`/`threadId`). |
| `globals.css` | Global Tailwind base styles/resets. Imported once in the root layout. |

**Rule:** Every page listed in `docs/pages.md` maps to exactly one folder/`page.tsx` here. No page exists without a corresponding entry in `docs/pages.md`, and no folder here exists without a corresponding page in that document.

---

## 4. `components/` — Reusable UI

**Purpose:** Houses every reusable component defined in `docs/components.md`, organized by domain subfolder matching the domains used in `docs/frontend.md`.

| Folder | Purpose |
|---|---|
| `components/ui/` | Unmodified/lightly wrapped shadcn/ui primitives. Domain components build on these; pages should not import `ui/` primitives directly except through a domain component. |
| `components/layout/` | App chrome: `Navbar`, `Footer`, `Sidebar` |
| `components/marketplace/` | Browse/search/product-display components |
| `components/listings/` | Listing creation/editing components |
| `components/reports/` | Reporting component (`ReportDialog`) |
| `components/notifications/` | `NotificationCard` |
| `components/messages/` | Chat components (`ThreadList`, `MessageThread`, `MessageComposer`) |
| `components/admin/` | Admin table components |
| `components/feedback/` | Cross-cutting UI state components (`LoadingSkeleton`, `EmptyState`, `ErrorState`, `ToastProvider`) |

**Rule:** Every component in `docs/components.md` has exactly one file here, in the subfolder matching its "Where It's Used" domain. File name is kebab-case; component export is PascalCase (see [Section 8](#8-naming-conventions)). No component is defined inline inside a page file if it is reused by more than one page, per `docs/frontend.md` (Section 9).

---

## 5. `lib/` — Application Logic

**Purpose:** All non-UI logic: API communication, authentication, validation schemas, and generic utilities. Nothing in `lib/` renders JSX directly (with the narrow exception of `auth-context.tsx`, which defines a Provider component but no visual markup).

| Folder | Purpose |
|---|---|
| `lib/api/` | `client.ts` is the single typed `fetch` wrapper (base URL, auth header, error normalization). Domain files (`listings.ts`, `wishlist.ts`, `profile.ts`, `reports.ts`, `admin.ts`, `messages.ts`, `notifications.ts`) expose typed functions per the endpoints in `api.md`. Pages/components never call `fetch` directly — always through these modules. |
| `lib/auth/` | Cognito integration and auth state. `auth-context.tsx` + `use-auth.ts` implement the `useAuth()` contract from `docs/frontend.md` (Section 5). `roles.ts` centralizes role constants and guard-check helpers used by layouts and `middleware.ts`. |
| `lib/validation/` | One schema file per form defined in `docs/frontend.md` (Section 10). Schemas are the single source of truth for both client-side validation and form value typing — never duplicated inline in a component. |
| `lib/utils/` | Small, generic helpers with no domain knowledge (`cn.ts` for class merging, `format.ts` for price/date formatting used across `PriceBadge`, `NotificationCard`, tables, etc.). |

---

## 6. `types/` — Shared TypeScript Types

**Purpose:** Single source of truth for domain data shapes, mirroring the API contract in `api.md`. Components and `lib/api/*` functions import from here rather than redefining shapes locally.

| File | Purpose |
|---|---|
| `types/listing.ts` | `Listing`, `ListingFilters`, listing status union |
| `types/user.ts` | `User`, role union (`"STUDENT" \| "ADMIN"`) |
| `types/wishlist.ts` | `WishlistItem` |
| `types/report.ts` | `Report` |
| `types/notification.ts` | `Notification` |
| `types/message.ts` | `Message`, `MessageThreadSummary` |
| `types/api.ts` | Shared request/response envelope types (e.g., pagination wrapper, `ApiError` shape) |

**Rule:** A type used by more than one component or API module must live here, not be re-declared locally. Component-local prop interfaces (as documented per-component in `docs/components.md`) remain co-located with their component, but they reference these shared domain types (e.g., `ProductCardProps.listing: Listing`).

---

## 7. Root-Level Files

| File | Purpose |
|---|---|
| `middleware.ts` | Runs on every request to `(student)` and `(admin)` routes; performs the lightweight session-presence check described in `docs/routing.md` (Section 6, Layer 1) and redirects unauthenticated requests to `/login`. |
| `next.config.*` | Standard Next.js configuration |
| `tailwind.config.*` | Tailwind CSS configuration (theme tokens, once `ui-design-system.md` exists, are sourced from it) |
| `tsconfig.json` | TypeScript configuration (strict mode enabled, per `docs/frontend.md` Section 15) |
| `package.json` | Dependencies and scripts |

---

## 8. Naming Conventions

Consistent with `docs/frontend.md` (Section 15):

- **Files:** kebab-case (e.g., `product-card.tsx`, `use-auth.ts`)
- **Components:** PascalCase exports (e.g., `ProductCard`, `WishlistButton`)
- **Types/interfaces:** PascalCase (e.g., `Listing`, `ProductCardProps`)
- **Variables/functions:** camelCase
- **Route folders:** lowercase, matching the URL segment exactly (e.g., `marketplace/`, `[listingId]/`)
- **Default exports:** reserved for `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, and `not-found.tsx` files only, per Next.js convention. All other components use named exports.

---

## 9. Consistency Rules

This structure is the single canonical layout for the CampusMart AI frontend. To keep it that way:

1. **One page, one route, one folder.** Every route in `docs/routing.md`'s Full Route Table corresponds to exactly one folder under `app/`, and vice versa — no route exists without a matching entry there, and no `app/` folder exists without a matching route.
2. **One component, one file.** Every component in `docs/components.md` has exactly one implementation file under `components/`, in the domain subfolder matching its documented usage.
3. **No duplicate logic across `lib/api/` modules.** Each API domain module owns its endpoints exclusively (e.g., only `lib/api/listings.ts` calls `/listings*` endpoints).
4. **No new top-level folders under `src/`** beyond `app/`, `components/`, `lib/`, `types/` without updating this document first.
5. **No alternate state-management, routing, or styling systems** are introduced — this structure assumes exactly the stack defined in `docs/frontend.md` (Section 1).
6. **Backend code does not live in this repository structure.** Per `docs/frontend.md` (Section 16 — Do Not Implement), Lambda, DynamoDB, S3 upload-signing, Rekognition, EventBridge, SES, and CloudWatch logic are out of scope for this folder structure entirely.
