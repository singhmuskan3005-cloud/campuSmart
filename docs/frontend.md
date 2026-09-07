# CampusMart AI — Frontend Implementation Guide

This document is the frontend build specification for CampusMart AI. It is written for an AI coding assistant (Cursor) to implement the Next.js application. It is based strictly on the CampusMart AI Final Architecture Specification, `docs/architecture.md`, and `docs/features.md`.

**Scope boundary:** This document covers the frontend only. It does not define or implement backend architecture (Lambda internals, DynamoDB schemas, S3 upload signing logic, Rekognition, EventBridge, or SES). The frontend interacts with the backend exclusively through the REST API described in `api.md`, treated as an external contract.

---

## Table of Contents

1. [Technology Stack](#1-technology-stack)
2. [Project Structure](#2-project-structure)
3. [Routing (App Router)](#3-routing-app-router)
4. [Layouts](#4-layouts)
5. [Authentication (Frontend)](#5-authentication-frontend)
6. [Protected Routes](#6-protected-routes)
7. [RBAC UI Behavior](#7-rbac-ui-behavior)
8. [API Communication Layer](#8-api-communication-layer)
9. [Component Architecture](#9-component-architecture)
10. [Forms and Validation](#10-forms-and-validation)
11. [Loading States](#11-loading-states)
12. [Error States](#12-error-states)
13. [Responsive Design](#13-responsive-design)
14. [Accessibility](#14-accessibility)
15. [TypeScript Conventions](#15-typescript-conventions)
16. [Do Not Implement](#16-do-not-implement)

---

## 1. Technology Stack

- **Framework:** Next.js 15 (App Router only — no Pages Router)
- **Language:** TypeScript (strict mode)
- **UI Library:** React
- **Styling:** Tailwind CSS
- **Component Primitives:** shadcn/ui
- **HTTP:** native `fetch` wrapped in a typed API client (see [Section 8](#8-api-communication-layer))

Do not introduce additional frontend frameworks, state management libraries, or CSS solutions beyond what is listed above unless explicitly requested later.

---

## 2. Project Structure

```
src/
  app/
    (public)/
      layout.tsx                        # public layout (marketing/auth shell)
      page.tsx                          # "/"
      login/
        page.tsx                        # "/login"
      signup/
        page.tsx                        # "/signup"
      forgot-password/
        page.tsx                        # "/forgot-password"

    (student)/
      layout.tsx                        # protected student layout (auth + STUDENT role guard)
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
        page.tsx                        # "/listings" (my listings)
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
        layout.tsx                      # protected admin layout (auth + ADMIN role guard)
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

    layout.tsx                          # root layout
    globals.css
    not-found.tsx
    error.tsx

  components/
    ui/                                 # shadcn/ui primitives (button, input, dialog, etc.)
    layout/
      navbar.tsx
      footer.tsx
      sidebar.tsx
    marketplace/
      product-card.tsx
      product-grid.tsx
      search-bar.tsx
      filter-panel.tsx
      category-card.tsx
      wishlist-button.tsx
      product-image-gallery.tsx
      price-badge.tsx
    listings/
      listing-form.tsx
      image-uploader.tsx
    reports/
      report-dialog.tsx
    notifications/
      notification-card.tsx
    messages/
      thread-list.tsx
      message-thread.tsx
      message-composer.tsx
    admin/
      users-table.tsx
      listings-table.tsx
      reports-table.tsx
    feedback/
      loading-skeleton.tsx
      empty-state.tsx
      error-state.tsx
      toast-provider.tsx

  lib/
    api/
      client.ts                         # typed fetch wrapper
      listings.ts                       # listings API functions
      wishlist.ts
      profile.ts
      reports.ts
      admin.ts
      messages.ts                       # messages/threads API functions
      notifications.ts                  # notifications API functions
    auth/
      auth-context.tsx                  # auth state provider
      use-auth.ts                       # auth hook
      cognito.ts                        # Cognito client-side integration
      roles.ts                          # role constants and guard helpers
    validation/
      listing-schema.ts
      profile-schema.ts
      report-schema.ts
      auth-schema.ts
    utils/
      cn.ts
      format.ts

  types/
    listing.ts
    user.ts
    wishlist.ts
    report.ts
    notification.ts
    message.ts
    api.ts

middleware.ts                           # route-level auth/role guard (project root, outside src/)
```

**Conventions:**

- Route groups `(public)`, `(student)`, `(admin)` organize protection level without affecting the URL path.
- Every route segment that needs a distinct protected layout has its own `layout.tsx`.
- Feature-specific components live in a subfolder named after the feature domain; shared primitives live in `components/ui`.

---

## 3. Routing (App Router)

All routing uses the Next.js App Router (`app/` directory). Every page listed in the specification maps to a folder with a `page.tsx`:

**Public routes**
- `/`
- `/login`
- `/signup`
- `/forgot-password`

**Student routes** (require authentication)
- `/marketplace`
- `/marketplace/[listingId]`
- `/sell`
- `/listings`
- `/listings/[listingId]/edit`
- `/wishlist`
- `/messages`
- `/messages/[threadId]`
- `/notifications`
- `/profile`
- `/settings`

**Admin routes** (require authentication + ADMIN role)
- `/admin`
- `/admin/users`
- `/admin/listings`
- `/admin/reports`

**Rules:**

- Dynamic segments (`[listingId]`, `[threadId]`) are typed via `params: { listingId: string }` in each page's props.
- Pages are React Server Components by default. Add `"use client"` only to components that need interactivity, browser APIs, or React state/hooks.
- Data-fetching pages should fetch initial data on the server where practical (via the API client) and hydrate client components with the result, rather than always fetching client-side on mount.
- No route outside this list should be created without an explicit request.

---

## 4. Layouts

- **Root layout (`app/layout.tsx`):** HTML shell, global fonts, `globals.css`, wraps the app in `AuthProvider` and `ToastProvider`.
- **Public layout (`app/(public)/layout.tsx`):** Minimal shell (logo, footer) for landing/auth pages — no authenticated navbar.
- **Student layout (`app/(student)/layout.tsx`):** Renders `Navbar` (with links to marketplace, sell, wishlist, messages, notifications, profile). Wrapped by a client-side auth guard that requires the `STUDENT` role (see [Section 6](#6-protected-routes)); `Sidebar` is an admin-only component and is not rendered here.
- **Admin layout (`app/(admin)/admin/layout.tsx`):** Renders an admin-specific navbar/sidebar (users, listings, reports) and is wrapped by both an auth guard and a role guard restricted to `ADMIN`.

Each layout is responsible only for structural chrome (navigation, containers) — page-level data fetching stays in the page components.

---

## 5. Authentication (Frontend)

Authentication state is managed via `lib/auth/auth-context.tsx`, backed by Cognito on the client (`lib/auth/cognito.ts`).

**Responsibilities of the auth layer:**

- Wrap Cognito sign-up, sign-in, sign-out, and session/token retrieval behind a small typed interface.
- Expose the current user (`userId`, `email`, `role`) and authentication status (`loading`, `authenticated`, `unauthenticated`) via `useAuth()`.
- Attach the current Cognito ID/access token to every request made through the API client (`lib/api/client.ts`).
- Refresh or clear tokens on expiry; on refresh failure, treat the user as unauthenticated and redirect to `/login`.

**`useAuth()` shape (conceptual):**

```ts
interface AuthState {
  status: "loading" | "authenticated" | "unauthenticated";
  user: { userId: string; email: string; role: "STUDENT" | "ADMIN" } | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (input: SignUpInput) => Promise<void>;
  signOut: () => Promise<void>;
}
```

The frontend never assumes a role — it always derives the role from the authenticated token/session, never from local component state that could be tampered with.

---

## 6. Protected Routes

Route protection is layered — this is a UX convenience, not the security boundary (all real enforcement happens server-side per `docs/architecture.md`).

- `middleware.ts` performs a lightweight check (presence of a valid session) and redirects unauthenticated users away from `(student)` and `(admin)` route groups to `/login`.
- The `(student)/layout.tsx` and `(admin)/admin/layout.tsx` client components additionally use `useAuth()` to:
  - Show a loading state while auth status resolves.
  - Redirect to `/login` if `status === "unauthenticated"`.
  - For student layout only: redirect to `/admin` if `status === "authenticated"` but `user.role !== "STUDENT"` (i.e., the account is an ADMIN).
  - For admin layout only: redirect to `/marketplace` (or show a 403 view) if `status === "authenticated"` but `user.role !== "ADMIN"`.
- API calls that fail with a 401/403 response trigger the same redirect behavior via the API client's shared error handling.

---

## 7. RBAC UI Behavior

The frontend reflects role-based restrictions for usability, while acknowledging (per `docs/architecture.md`) that this is never a substitute for backend enforcement.

| UI Behavior | Rule |
|---|---|
| Admin nav links (`/admin/*`) | Rendered only when `user.role === "ADMIN"` |
| "Edit"/"Delete" on a listing | Rendered only when `listing.sellerId === user.userId` |
| Admin moderation controls | Rendered only within `(admin)` routes, only for `ADMIN` |
| Report action | Available to any authenticated student, hidden for the listing's own seller |
| Wishlist button | Available to any authenticated student |

Hiding a control in the UI is always paired with the assumption that the corresponding API call is independently protected server-side; the frontend must never rely on UI hiding alone and must gracefully handle a 403 response from the API (see [Section 12](#12-error-states)).

---

## 8. API Communication Layer

All backend communication goes through `lib/api/client.ts`, a single typed wrapper around `fetch`. Domain-specific modules (`lib/api/listings.ts`, `wishlist.ts`, `profile.ts`, `reports.ts`, `admin.ts`, `messages.ts`, `notifications.ts`) call this client and expose typed functions per endpoint defined in `api.md`.

**Client responsibilities:**

- Prefix requests with the configured API base URL (from an environment variable, never hardcoded).
- Attach the `Authorization` header with the current Cognito token from `useAuth()` / a token-retrieval utility.
- Serialize/deserialize JSON; throw a typed `ApiError` (status code + message) on non-2xx responses.
- Centralize handling of 401 (redirect to login) and 403 (show forbidden state) responses.
- Never contain business logic — only request/response plumbing.

**Example shape:**

```ts
// lib/api/listings.ts
export async function getListings(params: ListingQuery): Promise<Listing[]> { ... }
export async function getListing(id: string): Promise<Listing> { ... }
export async function createListing(input: CreateListingInput): Promise<Listing> { ... }
export async function updateListing(id: string, input: UpdateListingInput): Promise<Listing> { ... }
export async function deleteListing(id: string): Promise<void> { ... }
```

All request/response types live in `types/` and mirror the contract in `api.md` exactly — the frontend does not invent additional fields.

---

## 9. Component Architecture

Components are organized by domain (see [Section 2](#2-project-structure)) and follow these rules:

- **Server vs. Client:** Default to Server Components. Mark a component `"use client"` only when it needs `useState`, `useEffect`, event handlers, or browser-only APIs (e.g., `ImageUploader`, `ListingForm`, `WishlistButton`, `SearchBar`, `FilterPanel`, chat components).
- **Reusability:** Presentational components (`ProductCard`, `NotificationCard`, `PriceBadge`) accept typed props and contain no data-fetching logic — data is fetched in the parent page/container and passed down.
- **Composition over configuration:** Prefer composing small components (e.g., `ProductGrid` renders a list of `ProductCard`) over large components with many conditional branches.
- **shadcn/ui usage:** Use shadcn/ui primitives (`Button`, `Input`, `Dialog`, `Toast`, `Skeleton`, `Table`, etc.) as the base for all interactive elements; wrap them in domain components rather than using primitives directly in pages.

**Component inventory (from the specification):**

Navbar, Footer, Sidebar, ProductCard, ProductGrid, SearchBar, FilterPanel, CategoryCard, WishlistButton, ImageUploader, ProductImageGallery, PriceBadge, ListingForm, ReportDialog, NotificationCard, Chat components (ThreadList, MessageThread, MessageComposer), Admin tables (UsersTable, ListingsTable, ReportsTable), Loading states, Skeletons, Empty states, Error states, Toast notifications.

No components outside this inventory (plus their natural sub-parts) should be introduced without explicit request.

---

## 10. Forms and Validation

All forms (`ListingForm`, `ReportDialog`, login/signup forms, profile form) follow a consistent pattern:

- **Schema-defined validation:** Each form's shape and rules are defined once in `lib/validation/*.ts` and reused for both client-side validation and TypeScript typing of form values.
- **Client-side validation** runs before submission to give immediate feedback (required fields, format checks, numeric ranges such as price > 0).
- **Server-side validation is authoritative** — the frontend must correctly display validation errors returned by the API (field-level where possible), not assume client-side validation is sufficient.
- **Field-level error display:** Each field shows its own error message beneath it; forms also support a form-level error summary for non-field-specific errors (e.g., "Something went wrong, please try again").
- **Disabled submit state:** Submit buttons are disabled while a request is in flight and while the form is in an invalid state (once touched).

**Forms in scope:**

| Form | Fields | Notes |
|---|---|---|
| Signup | name, email, password | Client + Cognito-driven validation |
| Login | email, password | |
| Forgot Password | email (+ reset flow) | |
| Listing Form (create/edit) | title, description, price, category, condition, images | Shared component for `/sell` and `/listings/[listingId]/edit` |
| Report Dialog | reason, details (optional) | Modal form |
| Profile Form | name, profile fields | |

---

## 11. Loading States

Every data-driven view implements an explicit loading state — no blank screens.

- **Page-level loads:** Use `loading.tsx` per route segment where the App Router convention applies, showing a `LoadingSkeleton` matching the page's eventual layout (e.g., grid of skeleton cards for `/marketplace`).
- **Component-level loads:** Buttons that trigger async actions (submit, delete, wishlist toggle) show an inline spinner/disabled state during the request.
- **Skeletons over spinners** are preferred for content-shaped areas (product grid, tables, listing detail) to reduce layout shift; simple spinners are acceptable for small inline actions.

---

## 12. Error States

- **Route-level errors:** Use `error.tsx` per route segment to catch rendering errors and show a recoverable `ErrorState` component with a retry action.
- **Not-found states:** Use `not-found.tsx` at the root and per-route where applicable (e.g., an invalid `listingId`) to show a clear "not found" message with a link back to the marketplace.
- **API error mapping:**
  - `400` → field-level or form-level validation error message
  - `401` → redirect to `/login`
  - `403` → forbidden `ErrorState` ("You don't have permission to do this") — this is expected to be hit even when the UI hides a control, since backend enforcement is authoritative
  - `404` → not-found state for the specific resource
  - `5xx` → generic `ErrorState` with retry
- **Toasts** (`ToastProvider`) surface transient success/error feedback for actions like wishlist toggle, report submission, and profile updates, without blocking the page.

---

## 13. Responsive Design

- Tailwind's responsive breakpoints (`sm`, `md`, `lg`, `xl`) are used throughout; mobile-first styling is the default (base classes target mobile, larger breakpoints layer on enhancements).
- `ProductGrid` collapses from multi-column (desktop) to single/double-column (mobile).
- `Navbar` collapses into a mobile menu below the `md` breakpoint.
- `Sidebar` (admin) collapses to a toggleable drawer on smaller screens.
- Tables (`UsersTable`, `ListingsTable`, `ReportsTable`) are horizontally scrollable on small screens rather than broken/overflowing.
- Forms stack fields vertically on mobile and may use multi-column layouts on larger screens where appropriate (e.g., `ListingForm`).

---

## 14. Accessibility

- All interactive elements are keyboard-navigable and use semantic HTML (`button`, `nav`, `form`, `label`) or appropriate ARIA roles when using shadcn/ui primitives that render non-native elements.
- Every form input has an associated, visible `label` (or `aria-label` where a visible label isn't practical).
- Images (`ProductImageGallery`, `ProductCard` thumbnails) require meaningful `alt` text derived from the listing title; decorative icons use `aria-hidden`.
- Color contrast for text and interactive elements meets WCAG AA guidance within the Tailwind theme.
- Focus states are visible for all interactive elements (do not remove default focus rings without providing an equivalent custom style).
- Toasts and inline errors are announced to assistive technology via appropriate `aria-live` regions.
- Modals (`ReportDialog`) trap focus while open and restore focus to the triggering element on close.

---

## 15. TypeScript Conventions

- **Strict mode** enabled project-wide; no implicit `any`.
- **Domain types** live in `types/` (`Listing`, `User`, `WishlistItem`, `Report`, `Notification`, `Message`) and mirror the API contract in `api.md`. UI components import these types rather than redefining shapes locally.
- **Props interfaces** are named `<ComponentName>Props` and defined directly above the component, or co-located if reused.
- **No implicit `any` in API responses** — every API client function has an explicit return type.
- **Enums/unions over magic strings:** roles (`"STUDENT" | "ADMIN"`), listing status (`"ACTIVE" | "EXPIRED" | "REMOVED" | "FLAGGED"`), etc., are defined once in `types/` and reused everywhere.
- **Naming:** camelCase for variables/functions, PascalCase for components/types, kebab-case for file names (except component files may use PascalCase exports from kebab-case files, e.g., `product-card.tsx` exporting `ProductCard`).
- **No default exports** for components except page/layout files, which follow Next.js conventions requiring a default export.

---

## 16. Do Not Implement

To keep this document within its intended scope, the frontend implementation must **not** include:

- Lambda function code or business logic
- DynamoDB table/index definitions or access-pattern implementation
- S3 upload-signing implementation details (the frontend only calls the backend-provided upload mechanism and uploads to the returned target)
- Rekognition integration logic
- EventBridge rules or scheduled workflow implementation
- SES email sending/template logic
- CloudWatch configuration

These are backend concerns and are documented separately in `docs/architecture.md`, `api.md`, and `database.md`.
