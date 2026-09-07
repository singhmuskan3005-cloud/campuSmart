# CampusMart AI — Pages Documentation

This document specifies every page defined in the CampusMart AI Final Architecture Specification (Section 24 — Frontend Pages) and detailed further in `docs/frontend.md`. No pages outside this list are introduced. Each page is documented with its route, purpose, access level, layout, components, user actions, API interactions, and UI states, consistent with `docs/architecture.md`, `docs/features.md`, and `docs/frontend.md`.

---

## Table of Contents

**Public Pages**
1. [Home](#1-home)
2. [Login](#2-login)
3. [Signup](#3-signup)
4. [Forgot Password](#4-forgot-password)

**Student Pages**
5. [Marketplace](#5-marketplace)
6. [Listing Detail](#6-listing-detail)
7. [Sell Item](#7-sell-item)
8. [My Listings](#8-my-listings)
9. [Edit Listing](#9-edit-listing)
10. [Wishlist](#10-wishlist)
11. [Messages](#11-messages)
12. [Message Thread](#12-message-thread)
13. [Notifications](#13-notifications)
14. [Profile](#14-profile)
15. [Settings](#15-settings)

**Admin Pages**
16. [Admin Dashboard](#16-admin-dashboard)
17. [Admin Users](#17-admin-users)
18. [Admin Listings](#18-admin-listings)
19. [Admin Reports](#19-admin-reports)

---

## 1. Home

**Route:** `/`

**Purpose:** Public landing page introducing CampusMart AI and directing visitors to sign up or log in.

**Access Level:** Public (no authentication required)

**Layout:** Public layout — minimal shell (logo, footer), no authenticated navbar

**Components:** `Footer`, marketing content sections, call-to-action buttons (Server Component; no client interactivity required)

**User Actions:**
- Navigate to `/signup`
- Navigate to `/login`
- Navigate to `/marketplace` if already authenticated (see Navigation Behavior)

**API Interactions:** None required for rendering. May optionally check auth status client-side to adjust CTA copy.

**Loading State:** Standard Next.js page load; no data-fetch loading state needed (static content)

**Empty State:** Not applicable

**Error State:** Standard `error.tsx` fallback if rendering fails

**Mobile Behavior:** Single-column stacked layout; CTAs remain visible without scrolling where possible

**Navigation Behavior:** If the user is already authenticated, links to "Get Started" redirect to the role-appropriate landing page (`/marketplace` for STUDENT, `/admin` for ADMIN) instead of `/signup`; unauthenticated visitors see standard signup/login CTAs

---

## 2. Login

**Route:** `/login`

**Purpose:** Allow a registered user (student or admin) to authenticate.

**Access Level:** Public (redirects authenticated users away)

**Layout:** Public layout

**Components:** Login form (email, password fields, submit button), link to `/signup` and `/forgot-password`

**User Actions:**
- Enter email and password
- Submit login form
- Navigate to `/signup` or `/forgot-password`

**API Interactions:** Cognito sign-in call via `lib/auth/cognito.ts` (not a REST API Gateway call); on success, tokens are stored in auth context

**Loading State:** Submit button shows a spinner and is disabled while authentication is in progress

**Empty State:** Not applicable

**Error State:** Inline form-level error for invalid credentials ("Incorrect email or password"); field-level errors for missing/invalid input

**Mobile Behavior:** Single-column, full-width form fields, comfortable tap targets

**Navigation Behavior:** On successful login, redirects to `/marketplace` for students or `/admin` for admins, based on the authenticated user's role. If already authenticated, visiting `/login` redirects immediately to the role-appropriate landing page.

---

## 3. Signup

**Route:** `/signup`

**Purpose:** Allow a new student to create a CampusMart account.

**Access Level:** Public (redirects authenticated users away)

**Layout:** Public layout

**Components:** Signup form (name, email, password fields, submit button), link to `/login`

**User Actions:**
- Fill out and submit the signup form
- Navigate to `/login`

**API Interactions:** Cognito sign-up call; triggers email verification flow

**Loading State:** Submit button shows a spinner and is disabled during submission

**Empty State:** Not applicable

**Error State:** Field-level validation errors (invalid email, weak password); form-level error for "email already in use"

**Mobile Behavior:** Single-column, full-width form fields

**Navigation Behavior:** On successful signup, navigates to a verification-pending confirmation state (and/or `/login` once verified). If already authenticated, redirects to the role-appropriate landing page.

---

## 4. Forgot Password

**Route:** `/forgot-password`

**Purpose:** Allow a user to reset a forgotten password.

**Access Level:** Public

**Layout:** Public layout

**Components:** Password reset request form (email field), and a follow-up confirmation-code/new-password form

**User Actions:**
- Submit email to request a reset code
- Enter reset code and new password
- Navigate back to `/login`

**API Interactions:** Cognito forgot-password and confirm-forgot-password calls

**Loading State:** Submit button disabled with spinner during each step

**Empty State:** Not applicable

**Error State:** Field-level errors (invalid email, invalid/expired code, weak password); form-level error for unknown account (generic messaging to avoid account enumeration)

**Mobile Behavior:** Single-column, full-width form fields

**Navigation Behavior:** On successful password reset, redirects to `/login` with a success message

---

## 5. Marketplace

**Route:** `/marketplace`

**Purpose:** Primary browse/search page where students discover active listings.

**Access Level:** Student (authenticated)

**Layout:** Student layout (Navbar + content area)

**Components:** `SearchBar`, `FilterPanel`, `CategoryCard` (category shortcuts), `ProductGrid` (composed of `ProductCard`s), `LoadingSkeleton`, `EmptyState`, `ErrorState`

**User Actions:**
- Enter search keywords
- Apply/clear category and other filters
- Click a `ProductCard` to view listing detail
- Toggle `WishlistButton` directly from a card

**API Interactions:** `GET /listings` (with query params for search/filter/pagination) on load and whenever search/filter state changes; `POST /wishlist` / `DELETE /wishlist/{listingId}` on wishlist toggle

**Loading State:** `LoadingSkeleton` grid matching the `ProductGrid` layout while listings load or refresh

**Empty State:** `EmptyState` with messaging such as "No listings match your search" and a clear-filters action

**Error State:** `ErrorState` with retry action if `GET /listings` fails

**Mobile Behavior:** `ProductGrid` collapses to 1–2 columns; `FilterPanel` collapses into a toggleable drawer/sheet triggered by a filter button

**Navigation Behavior:** Default landing page after student login; clicking a product navigates to `/marketplace/[listingId]`; category shortcuts apply a filter and stay on `/marketplace`

---

## 6. Listing Detail

**Route:** `/marketplace/[listingId]`

**Purpose:** Show full details of a single listing so a student can decide to wishlist, contact the seller, or report it.

**Access Level:** Student (authenticated)

**Layout:** Student layout

**Components:** `ProductImageGallery`, `PriceBadge`, seller info section, `WishlistButton`, contact-seller action, `ReportDialog` trigger, `LoadingSkeleton`, `ErrorState`

**User Actions:**
- View image gallery
- Toggle wishlist
- Initiate contact with the seller (navigates into Messages)
- Open `ReportDialog` and submit a report

**API Interactions:** `GET /listings/{id}` on load; `POST /wishlist` / `DELETE /wishlist/{listingId}`; `POST /reports` on report submission; message-thread creation call when contacting the seller

**Loading State:** `LoadingSkeleton` matching detail-page layout (image area + text blocks)

**Empty State:** Not applicable (a valid listing always has content); a listing with no images shows a placeholder image state within `ProductImageGallery`

**Error State:** Not-found state (`not-found.tsx` equivalent) for deleted/invalid/expired listing IDs; `ErrorState` with retry for transient failures

**Mobile Behavior:** Image gallery becomes a swipeable single-image carousel; action buttons (wishlist, contact, report) stack below content and remain easily reachable

**Navigation Behavior:** Reached from `/marketplace` or a shared link; "Contact Seller" navigates to `/messages/[threadId]` (creating the thread if needed); back navigation returns to the marketplace with prior filter/search state preserved where feasible

---

## 7. Sell Item

**Route:** `/sell`

**Purpose:** Allow a student to create a new listing.

**Access Level:** Student (authenticated)

**Layout:** Student layout

**Components:** `ListingForm` (title, description, price, category, condition), `ImageUploader`

**User Actions:**
- Fill out listing fields
- Upload one or more images
- Submit the form to publish the listing
- Cancel/navigate away

**API Interactions:** Request for a secure image upload mechanism, followed by direct upload to S3 (via backend-provided target); `POST /listings` on submit with validated data and image references

**Loading State:** Upload progress indicator on `ImageUploader` per image; submit button spinner/disabled state while `POST /listings` is in flight

**Empty State:** Not applicable (form starts empty by design)

**Error State:** Field-level validation errors; form-level error banner for server-side validation failures or upload failures (e.g., image flagged, upload interrupted)

**Mobile Behavior:** Form fields stack in a single column; `ImageUploader` supports camera/gallery selection via native file input; sticky submit button at the bottom of the viewport

**Navigation Behavior:** On successful submission, redirects to the newly created listing's detail page (`/marketplace/[listingId]`); accessible from the Navbar "Sell" link

---

## 8. My Listings

**Route:** `/listings`

**Purpose:** Let a student view and manage the listings they've created.

**Access Level:** Student (authenticated)

**Layout:** Student layout

**Components:** `ProductGrid`/list variant showing the student's own listings with status badges (`PriceBadge`, status indicator), edit/delete actions, `LoadingSkeleton`, `EmptyState`, `ErrorState`

**User Actions:**
- View own listings and their status (active, expired, removed, flagged)
- Navigate to edit a listing
- Delete a listing (with confirmation)

**API Interactions:** `GET /listings` scoped to the authenticated seller (`sellerId` derived from the token); `DELETE /listings/{id}` on delete confirmation

**Loading State:** `LoadingSkeleton` list/grid while listings load

**Empty State:** `EmptyState` with "You haven't listed anything yet" and a CTA to `/sell`

**Error State:** `ErrorState` with retry on load failure; inline toast error if delete fails

**Mobile Behavior:** Cards stack vertically; edit/delete actions available via a compact menu (e.g., overflow icon) rather than always-visible buttons

**Navigation Behavior:** Reached via Navbar/profile menu; "Edit" navigates to `/listings/[listingId]/edit`; deleting removes the item from the list in place without a full page reload

---

## 9. Edit Listing

**Route:** `/listings/[listingId]/edit`

**Purpose:** Allow the listing owner to update an existing listing's details or images.

**Access Level:** Student (authenticated), restricted to the listing's owner

**Layout:** Student layout

**Components:** `ListingForm` (pre-populated), `ImageUploader` (showing existing + newly added images)

**User Actions:**
- Modify listing fields
- Add or remove images
- Submit updates
- Cancel and return to `/listings`

**API Interactions:** `GET /listings/{id}` on load to pre-populate the form; `PUT /listings/{id}` on submit; image upload flow reused from Sell Item for any new images

**Loading State:** `LoadingSkeleton` while existing listing data loads; submit button spinner during update

**Empty State:** Not applicable

**Error State:** Not-found/forbidden state if the listing doesn't exist or the authenticated user is not the owner (server-enforced; frontend displays a clear "You don't have permission to edit this listing" message if a 403 is returned); field-level and form-level validation errors on submit

**Mobile Behavior:** Same single-column stacked form behavior as Sell Item

**Navigation Behavior:** Reached from `/listings`; on successful update, redirects back to `/listings` or to the listing detail page

---

## 10. Wishlist

**Route:** `/wishlist`

**Purpose:** Show the listings a student has saved.

**Access Level:** Student (authenticated)

**Layout:** Student layout

**Components:** `ProductGrid` (composed of `ProductCard`s with `WishlistButton` in the "remove" state), `LoadingSkeleton`, `EmptyState`, `ErrorState`

**User Actions:**
- View saved listings
- Remove a listing from the wishlist
- Click through to a listing's detail page

**API Interactions:** `GET /wishlist` on load; `DELETE /wishlist/{listingId}` on remove

**Loading State:** `LoadingSkeleton` grid while wishlist loads

**Empty State:** `EmptyState` with "Your wishlist is empty" and a CTA to `/marketplace`

**Error State:** `ErrorState` with retry on load failure; toast error if remove action fails

**Mobile Behavior:** Same responsive grid collapse behavior as Marketplace

**Navigation Behavior:** Reached via Navbar; removing an item updates the grid in place; clicking a product navigates to `/marketplace/[listingId]`

---

## 11. Messages

**Route:** `/messages`

**Purpose:** Show a student's list of message threads (conversations with buyers/sellers).

**Access Level:** Student (authenticated)

**Layout:** Student layout

**Components:** `ThreadList` (chat component), `LoadingSkeleton`, `EmptyState`, `ErrorState`

**User Actions:**
- View list of conversations
- Select a thread to open it

**API Interactions:** Retrieval of the authenticated user's message threads

**Loading State:** `LoadingSkeleton` list while threads load

**Empty State:** `EmptyState` with "No conversations yet" and a CTA to browse the marketplace

**Error State:** `ErrorState` with retry on load failure

**Mobile Behavior:** Full-width thread list; on mobile, selecting a thread navigates to a dedicated `/messages/[threadId]` view rather than a split-pane layout (which may be used on larger screens)

**Navigation Behavior:** Reached via Navbar; selecting a thread navigates to `/messages/[threadId]`

---

## 12. Message Thread

**Route:** `/messages/[threadId]`

**Purpose:** Show a single conversation and allow the student to send messages.

**Access Level:** Student (authenticated), restricted to thread participants

**Layout:** Student layout

**Components:** `MessageThread`, `MessageComposer`, `LoadingSkeleton`, `ErrorState`

**User Actions:**
- Read message history
- Compose and send a new message
- Navigate back to `/messages`

**API Interactions:** Retrieval of messages for the given thread on load; send-message call on submit

**Loading State:** `LoadingSkeleton` for message history while loading; composer submit button disabled/spinner while sending

**Empty State:** `EmptyState` for a newly created thread with no messages yet ("Say hello to get the conversation started")

**Error State:** Not-found/forbidden state if the thread doesn't exist or the user isn't a participant; `ErrorState` with retry for transient load failures; inline error if a message fails to send (with retry/resend option)

**Mobile Behavior:** Full-screen thread view with a fixed `MessageComposer` at the bottom; back action returns to `/messages`

**Navigation Behavior:** Reached from `/messages` or "Contact Seller" on a listing detail page; back button/link returns to `/messages`

---

## 13. Notifications

**Route:** `/notifications`

**Purpose:** Show the student's notifications (e.g., new messages, listing status changes, listing expiry).

**Access Level:** Student (authenticated)

**Layout:** Student layout

**Components:** `NotificationCard` list, `LoadingSkeleton`, `EmptyState`, `ErrorState`

**User Actions:**
- View notifications
- Click a notification to navigate to its related context (listing, thread, etc.)
- Mark a notification as read

**API Interactions:** Retrieval of the authenticated user's notifications on load; a mark-as-read update call fires when a notification is opened/clicked

**Loading State:** `LoadingSkeleton` list while notifications load

**Empty State:** `EmptyState` with "You're all caught up"

**Error State:** `ErrorState` with retry on load failure

**Mobile Behavior:** Full-width stacked list of `NotificationCard`s

**Navigation Behavior:** Reached via Navbar; clicking a notification navigates to the relevant listing, thread, or page referenced by that notification

---

## 14. Profile

**Route:** `/profile`

**Purpose:** Let a student view and edit their own profile information.

**Access Level:** Student (authenticated), scoped strictly to the authenticated user

**Layout:** Student layout

**Components:** Profile form (name, profile fields), `LoadingSkeleton`, `ErrorState`

**User Actions:**
- View current profile information
- Edit and save profile fields

**API Interactions:** `GET /profile` on load; `PUT /profile` on save

**Loading State:** `LoadingSkeleton` for form fields while profile data loads; submit button spinner during save

**Empty State:** Not applicable (profile always exists for an authenticated user)

**Error State:** `ErrorState` with retry on load failure; field-level and form-level validation errors on save

**Mobile Behavior:** Single-column stacked form

**Navigation Behavior:** Reached via Navbar/user menu; adjacent to `/settings`

---

## 15. Settings

**Route:** `/settings`

**Purpose:** Provide account-level settings for the student — specifically changing their password and signing out — distinct from the profile content on `/profile`.

**Access Level:** Student (authenticated), scoped strictly to the authenticated user

**Layout:** Student layout

**Components:** Settings form/sections, `LoadingSkeleton`, `ErrorState`

**User Actions:**
- Change password
- Sign out

**API Interactions:** Cognito change-password call and Cognito sign-out call. Both are handled directly through `lib/auth/cognito.ts`; `/settings` has no dedicated backend API (no API Gateway/Lambda/DynamoDB involvement) since it holds no data beyond what Cognito already manages.

**Loading State:** Spinner/disabled state on the change-password and sign-out actions while in flight

**Empty State:** Not applicable

**Error State:** Form-level/field-level errors on password change (e.g., current password incorrect, new password fails policy)

**Mobile Behavior:** Single-column stacked sections

**Navigation Behavior:** Reached via Navbar/user menu; adjacent to `/profile`; sign-out redirects to `/login`

---

## 16. Admin Dashboard

**Route:** `/admin`

**Purpose:** Central overview for administrators summarizing marketplace activity (users, listings, reports).

**Access Level:** Admin only (authenticated + `role === ADMIN`)

**Layout:** Admin layout (admin Navbar/Sidebar)

**Components:** Summary/overview cards, navigation into `/admin/users`, `/admin/listings`, `/admin/reports`, `LoadingSkeleton`, `ErrorState`

**User Actions:**
- View high-level marketplace summary
- Navigate to Users, Listings, or Reports sections

**API Interactions:** Summary-level admin data retrieval calls (e.g., counts sourced from `GET /admin/users`, `GET /admin/listings`, `GET /admin/reports`)

**Loading State:** `LoadingSkeleton` for summary cards while data loads

**Empty State:** `EmptyState` messaging per section if a given data set is empty (e.g., no open reports)

**Error State:** `ErrorState` with retry if summary data fails to load; forbidden state if a non-admin somehow reaches this route (defense in depth alongside the layout guard)

**Mobile Behavior:** Summary cards stack vertically; admin `Sidebar` collapses into a toggleable drawer

**Navigation Behavior:** Default landing page after admin login; sidebar links navigate to `/admin/users`, `/admin/listings`, `/admin/reports`

---

## 17. Admin Users

**Route:** `/admin/users`

**Purpose:** Let admins view and manage student/user accounts.

**Access Level:** Admin only

**Layout:** Admin layout

**Components:** `UsersTable`, `LoadingSkeleton`, `EmptyState`, `ErrorState`

**User Actions:**
- View list of users
- Paginate/sort the user table
- Take user-management actions exposed by the table (per `docs/features.md` — Manage Users)

**API Interactions:** `GET /admin/users` on load and on pagination/sort changes; relevant user-action calls on interaction

**Loading State:** `LoadingSkeleton` table rows while users load

**Empty State:** `EmptyState` with "No users found" (e.g., after filtering)

**Error State:** `ErrorState` with retry on load failure; toast error on failed row action; forbidden state if role verification fails

**Mobile Behavior:** `UsersTable` becomes horizontally scrollable; key columns (name, email, role, action) remain visible with less critical columns scrollable

**Navigation Behavior:** Reached via admin Sidebar; part of the `(admin)` route group protected by the admin layout guard

---

## 18. Admin Listings

**Route:** `/admin/listings`

**Purpose:** Let admins view and moderate all marketplace listings.

**Access Level:** Admin only

**Layout:** Admin layout

**Components:** `ListingsTable`, moderation action controls, `LoadingSkeleton`, `EmptyState`, `ErrorState`

**User Actions:**
- View all listings across all sellers
- Paginate/filter the listings table
- Take moderation actions (remove, flag) per `docs/features.md` — Manage Listings (Admin) / Moderate Marketplace Content

**API Interactions:** `GET /admin/listings` on load and on pagination/filter changes; moderation-action calls on interaction

**Loading State:** `LoadingSkeleton` table rows while listings load

**Empty State:** `EmptyState` with "No listings found" (e.g., after filtering)

**Error State:** `ErrorState` with retry on load failure; toast error on failed moderation action; forbidden state if role verification fails

**Mobile Behavior:** `ListingsTable` becomes horizontally scrollable; moderation actions available via a compact per-row menu

**Navigation Behavior:** Reached via admin Sidebar

---

## 19. Admin Reports

**Route:** `/admin/reports`

**Purpose:** Let admins review reports submitted by students and take administrative action.

**Access Level:** Admin only

**Layout:** Admin layout

**Components:** `ReportsTable`, report detail view, administrative action controls (keep, remove, flag, act on account), `LoadingSkeleton`, `EmptyState`, `ErrorState`

**User Actions:**
- View list of submitted reports
- Open a report's detail view
- Take an administrative action on a report (per `docs/features.md` — Review Reports / Take Administrative Action)

**API Interactions:** `GET /admin/reports` on load; `GET /reports/{id}` for detail view; action-specific calls (e.g., updating listing status, updating user status) on interaction

**Loading State:** `LoadingSkeleton` table/detail rows while reports load

**Empty State:** `EmptyState` with "No reports to review"

**Error State:** `ErrorState` with retry on load failure; toast error on failed action; forbidden state if role verification fails

**Mobile Behavior:** `ReportsTable` becomes horizontally scrollable; report detail view opens full-screen (e.g., via a route or drawer) rather than a side panel on small screens

**Navigation Behavior:** Reached via admin Sidebar; selecting a report opens its detail view (in-page expansion or dedicated detail state) with actions to resolve it
