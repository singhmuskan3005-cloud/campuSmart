# CampusMart AI — Feature Documentation

This document defines every feature described in the CampusMart AI Final Architecture Specification. No features outside the specification are included. Features are grouped by actor: Student features, Admin features, and System/Automation features (EventBridge and SES workflows explicitly defined in the specification).

---

## Table of Contents

**Student Features**
1. [Account Signup](#1-account-signup)
2. [Secure Login](#2-secure-login)
3. [Browse Marketplace Listings](#3-browse-marketplace-listings)
4. [Search and Filter Products](#4-search-and-filter-products)
5. [View Product Details](#5-view-product-details)
6. [Create Listing](#6-create-listing)
7. [Upload Product Images](#7-upload-product-images)
8. [Edit Own Listing](#8-edit-own-listing)
9. [Delete Own Listing](#9-delete-own-listing)
10. [Add/Remove Wishlist Item](#10-addremove-wishlist-item)
11. [Contact Sellers](#11-contact-sellers)
12. [Receive Notifications](#12-receive-notifications)
13. [Manage Profile](#13-manage-profile)
14. [Report Suspicious Listing](#14-report-suspicious-listing)

**Admin Features**
15. [Access Admin Dashboard](#15-access-admin-dashboard)
16. [Manage Users](#16-manage-users)
17. [Manage Listings (Admin)](#17-manage-listings-admin)
18. [Review Reports](#18-review-reports)
19. [Moderate Marketplace Content](#19-moderate-marketplace-content)
20. [Take Administrative Action](#20-take-administrative-action)

**System / Automation Features**
21. [Automated Image Moderation (Rekognition)](#21-automated-image-moderation-rekognition)
22. [Listing Expiry Automation (EventBridge)](#22-listing-expiry-automation-eventbridge)
23. [Transactional Email Notifications (SES)](#23-transactional-email-notifications-ses)

---

## 1. Account Signup

**Purpose:** Allow a new student to create an account so they can access the marketplace.

**User Story:** As a prospective student user, I want to sign up with my email so that I can create an account and start using CampusMart.

**Actor:** Student (unauthenticated visitor)

**Frontend Behavior:**
- `/signup` page with a registration form (name, email, password)
- Client-side validation before submission
- Displays loading state during submission
- Displays success state and prompts for email verification
- Displays error state on failure (e.g., email already in use)

**Backend Behavior:**
- Cognito creates the user account and triggers email verification
- No custom Lambda logic is required for the core signup call, as Cognito handles account creation directly

**AWS Services:** Amazon Cognito

**Validation:**
- Valid email format
- Password meets Cognito password policy
- Required fields present

**Edge Cases:**
- Email already registered
- Weak/invalid password
- Network failure during signup
- User abandons flow before verifying email

**Acceptance Criteria:**
- A new user can submit valid signup information and receive a verification email
- Invalid input is rejected with a clear, actionable error message
- No account is usable for login until email verification is complete

---

## 2. Secure Login

**Purpose:** Allow verified students and admins to authenticate and access the platform.

**User Story:** As a registered user, I want to log in securely so that I can access my account and marketplace features appropriate to my role.

**Actor:** Student, Admin

**Frontend Behavior:**
- `/login` page with email/password form
- Client-side validation
- Loading state while authenticating
- Error state for invalid credentials
- On success, stores authentication state and redirects to the appropriate landing page

**Backend Behavior:**
- Cognito authenticates credentials and issues authentication tokens (JWT)
- Tokens are attached to subsequent API Gateway requests
- Lambda functions verify identity and role from the token on protected requests

**AWS Services:** Amazon Cognito, API Gateway, AWS Lambda

**Validation:**
- Required fields present
- Credentials verified against Cognito

**Edge Cases:**
- Incorrect password
- Unverified email attempting login
- Expired or invalid token on subsequent requests
- Account does not exist

**Acceptance Criteria:**
- Valid credentials result in a successful login and issued tokens
- Invalid credentials are rejected with a generic, non-revealing error message
- Authenticated requests to the API include a valid token
- Unauthenticated requests to protected routes are rejected

---

## 3. Browse Marketplace Listings

**Purpose:** Let students discover items for sale across the marketplace.

**User Story:** As a student, I want to browse marketplace listings so that I can see what's available for purchase.

**Actor:** Student

**Frontend Behavior:**
- `/marketplace` page renders a product grid using `ProductCard` and `ProductGrid` components
- Displays loading skeletons while data loads
- Displays an empty state when no listings exist
- Displays an error state on request failure

**Backend Behavior:**
- Lambda queries DynamoDB for active listings and returns paginated JSON results

**AWS Services:** API Gateway, AWS Lambda, DynamoDB

**Validation:**
- Query parameters (pagination cursor, category) validated server-side

**Edge Cases:**
- No listings available
- Listings with missing/broken image references
- Expired listings must not appear in the default browse view

**Acceptance Criteria:**
- Active, non-expired listings are displayed in a responsive grid
- Loading, empty, and error states render correctly
- Expired listings are excluded from the default marketplace view

---

## 4. Search and Filter Products

**Purpose:** Help students quickly find relevant listings.

**User Story:** As a student, I want to search and filter listings by keyword and category so that I can find what I need faster.

**Actor:** Student

**Frontend Behavior:**
- `SearchBar` and `FilterPanel` components on `/marketplace`
- Debounced search input
- Filter state reflected in the UI and (optionally) the URL query string
- Loading state while results refresh; empty state when no matches found

**Backend Behavior:**
- Lambda queries DynamoDB using access patterns appropriate for the expected project scale (no external search service)

**AWS Services:** API Gateway, AWS Lambda, DynamoDB

**Validation:**
- Search term length limits
- Category values validated against known categories

**Edge Cases:**
- No results found for a search/filter combination
- Special characters in search input
- Simultaneous search + filter combination returning zero results

**Acceptance Criteria:**
- Search and filter update the product grid without a full page reload
- Empty results are communicated clearly to the user
- Search/filter logic relies solely on DynamoDB access patterns, not an external search engine

---

## 5. View Product Details

**Purpose:** Let a student see full information about a specific listing before contacting the seller or wishlisting it.

**User Story:** As a student, I want to view full details of a listing so that I can decide whether to purchase or contact the seller.

**Actor:** Student

**Frontend Behavior:**
- `/marketplace/[listingId]` page
- Displays `ProductImageGallery`, `PriceBadge`, description, seller info, and `WishlistButton`
- Loading state while fetching; error/not-found state for invalid or deleted listings

**Backend Behavior:**
- Lambda retrieves a single listing (`GET /listings/{id}`) from DynamoDB

**AWS Services:** API Gateway, AWS Lambda, DynamoDB

**Validation:**
- Listing ID format validated
- Listing existence and status (not expired/removed) checked before returning data

**Edge Cases:**
- Listing was deleted or expired after being linked/bookmarked
- Listing belongs to a removed/banned user

**Acceptance Criteria:**
- Valid listing IDs return complete listing details
- Invalid, deleted, or expired listing IDs return an appropriate not-found state
- Page renders correctly across screen sizes

---

## 6. Create Listing

**Purpose:** Allow a student to list an item for sale on the marketplace.

**User Story:** As a student, I want to create a listing with product details and images so that other students can see and purchase my item.

**Actor:** Student

**Frontend Behavior:**
- `/sell` page with `ListingForm` (title, description, price, category, condition, images)
- Client-side validation before submission
- Loading state during submission (including image upload progress)
- Success state redirects to the new listing; error state surfaces validation/server errors

**Backend Behavior:**
- Backend validates listing data
- Lambda stores listing metadata in DynamoDB with `status`, `createdAt`, and `expiresAt`
- Coordinates with the image upload and Rekognition analysis workflow (see [Feature 7](#7-upload-product-images))

**AWS Services:** API Gateway, AWS Lambda, DynamoDB, S3, Rekognition

**Validation:**
- Required fields: title, description, price, category, condition
- Price must be a positive number
- At least one image (as defined by product rules) may be required
- Server-side validation independent of client-side validation

**Edge Cases:**
- Submission with no images
- Invalid price (negative, non-numeric)
- Network failure mid-submission
- Image flagged by Rekognition during listing creation

**Acceptance Criteria:**
- A student can submit a complete, valid listing and see it published to the marketplace
- Invalid submissions are rejected with field-level error messages
- The listing is only persisted in DynamoDB after backend validation succeeds

---

## 7. Upload Product Images

**Purpose:** Allow students to attach images to their listings, stored securely and screened for inappropriate content.

**User Story:** As a student, I want to upload images of my item so that buyers can see what they're purchasing.

**Actor:** Student

**Frontend Behavior:**
- `ImageUploader` component on the Sell/Edit listing forms
- Requests a secure upload mechanism from the backend, then uploads directly to S3
- Displays upload progress, preview thumbnails, and error state on upload failure

**Backend Behavior:**
- Lambda issues a controlled/secure upload mechanism (e.g., a scoped upload credential) rather than proxying image bytes
- After upload, an image processing workflow triggers Rekognition analysis
- Image reference is stored with the listing metadata in DynamoDB (image bytes are never stored in DynamoDB)

**AWS Services:** API Gateway, AWS Lambda, S3, Rekognition

**Validation:**
- File type restrictions (image formats only)
- File size limits
- Maximum number of images per listing

**Edge Cases:**
- Upload interrupted mid-transfer
- Non-image file uploaded
- Image rejected by Rekognition moderation
- S3 upload succeeds but metadata save fails (orphaned image)

**Acceptance Criteria:**
- Images upload directly and securely to a private S3 bucket
- Only image references, never raw image data, are stored in DynamoDB
- Images are run through Rekognition before (or as part of) listing publication
- Upload failures are clearly surfaced to the user

---

## 8. Edit Own Listing

**Purpose:** Allow a student to update details of a listing they created.

**User Story:** As a seller, I want to edit my listing so that I can correct or update information after publishing it.

**Actor:** Student (listing owner)

**Frontend Behavior:**
- `/listings/[listingId]/edit` page pre-populated with existing listing data via `ListingForm`
- Client-side validation, loading, success, and error states

**Backend Behavior:**
- Lambda verifies the authenticated user is the listing's `sellerId` before allowing the update (`PUT /listings/{id}`)
- Validated updates are persisted to DynamoDB

**AWS Services:** API Gateway, AWS Lambda, DynamoDB, S3, Rekognition (if images are changed)

**Validation:**
- Same field validation as listing creation
- Ownership check: only the seller may edit their own listing

**Edge Cases:**
- Non-owner attempts to edit a listing via direct API call (must be rejected)
- Listing was deleted/expired before the edit was submitted
- New images added during edit must go through the same upload/moderation flow as creation

**Acceptance Criteria:**
- Only the listing owner can successfully edit a listing
- Non-owners receive an authorization error (enforced server-side, not just hidden in the UI)
- Updated data is reflected immediately in the marketplace and listing detail views

---

## 9. Delete Own Listing

**Purpose:** Allow a student to remove their own listing from the marketplace.

**User Story:** As a seller, I want to delete my listing so that it's no longer visible once the item is no longer available.

**Actor:** Student (listing owner)

**Frontend Behavior:**
- Delete action available on the seller's own listing (e.g., in `/listings`)
- Confirmation prompt before deletion
- Loading state during deletion; success removes the listing from the UI; error state on failure

**Backend Behavior:**
- Lambda verifies ownership before executing `DELETE /listings/{id}`
- Listing record removed or marked deleted in DynamoDB

**AWS Services:** API Gateway, AWS Lambda, DynamoDB

**Validation:**
- Ownership check: only the seller may delete their own listing
- Listing ID must exist

**Edge Cases:**
- Non-owner attempts deletion via direct API call (must be rejected)
- Listing already deleted or expired
- Listing has related wishlist/report records that reference it

**Acceptance Criteria:**
- Only the listing owner can delete their listing
- Deleted listings no longer appear in marketplace, search, or wishlist views
- Server-side ownership check is enforced regardless of frontend UI state

---

## 10. Add/Remove Wishlist Item

**Purpose:** Let students save listings they're interested in for later.

**User Story:** As a student, I want to add listings to a wishlist so that I can easily find them again later.

**Actor:** Student

**Frontend Behavior:**
- `WishlistButton` component on product cards and detail pages (toggle add/remove)
- `/wishlist` page lists saved products using `ProductGrid`
- Loading and error states on toggle actions

**Backend Behavior:**
- Lambda creates or deletes a wishlist record (`POST /wishlist`, `DELETE /wishlist/{listingId}`) associated with the authenticated user
- `GET /wishlist` retrieves the user's wishlist records and corresponding listings

**AWS Services:** API Gateway, AWS Lambda, DynamoDB

**Validation:**
- Listing ID must exist and be active
- Duplicate wishlist entries prevented

**Edge Cases:**
- Wishlisted listing later deleted or expired by the seller
- Rapid toggle clicks (add/remove race condition)

**Acceptance Criteria:**
- A student can add and remove listings from their wishlist
- The wishlist page accurately reflects the current saved items
- Deleted/expired listings are handled gracefully in the wishlist view

---

## 11. Contact Sellers

**Purpose:** Allow a student to communicate with a listing's seller.

**User Story:** As a student, I want to contact a seller so that I can ask questions or arrange a purchase.

**Actor:** Student

**Frontend Behavior:**
- Contact action on the product detail page opens/starts a conversation
- `/messages` and `/messages/[threadId]` pages with chat components
- Loading state while messages load; error state on failure

**Backend Behavior:**
- Lambda handles message creation/retrieval, persisting records associated with the listing and both participants in DynamoDB
- `GET /messages` retrieves the authenticated user's threads; `POST /messages` creates a new thread (e.g., contacting a seller from a listing); `GET /messages/{threadId}` retrieves a thread's message history; `POST /messages/{threadId}` sends a message within an existing thread

**AWS Services:** API Gateway, AWS Lambda, DynamoDB

**Validation:**
- Message content required and length-limited
- Sender must be an authenticated user; cannot message oneself as the seller

**Edge Cases:**
- Seller account no longer exists or listing was deleted
- Empty message submission
- Very long message threads (pagination)

**Acceptance Criteria:**
- Students can initiate and continue a conversation tied to a specific listing
- Message threads are only visible to the two participants
- Appropriate loading/error/empty states are shown

---

## 12. Receive Notifications

**Purpose:** Keep students informed of relevant marketplace activity.

**User Story:** As a student, I want to receive notifications so that I stay informed about my listings, messages, and wishlist activity.

**Actor:** Student

**Frontend Behavior:**
- `/notifications` page and `NotificationCard` component
- Toast notifications for real-time-feeling feedback within the app
- Loading, empty, and error states

**Backend Behavior:**
- Lambda writes notification records to DynamoDB as relevant events occur (e.g., new message, listing status change, listing expiry)
- `GET /notifications` retrieves a user's notifications through the backend API; `PATCH /notifications/{id}` marks a notification as read

**AWS Services:** API Gateway, AWS Lambda, DynamoDB

**Validation:**
- Notifications scoped strictly to the authenticated user

**Edge Cases:**
- Notification referencing a since-deleted listing or message thread
- Large volume of notifications (pagination/read state)

**Acceptance Criteria:**
- Users only see notifications addressed to them
- Notifications accurately reflect relevant system and marketplace events
- Notification list supports loading, empty, and error states

---

## 13. Manage Profile

**Purpose:** Allow students to view and update their own account/profile information.

**User Story:** As a student, I want to manage my profile so that my account information stays accurate.

**Actor:** Student

**Frontend Behavior:**
- `/profile` page with a profile form
- Client-side validation, loading, success, and error states
- `/settings` is a related but separate page limited to changing password and signing out (see `docs/pages.md` — Settings); it has no profile fields and no dedicated backend API of its own

**Backend Behavior:**
- Lambda handles `GET /profile` and `PUT /profile`, scoped to the authenticated user's `userId`
- `/settings` actions (change password, sign out) are handled directly via Cognito on the client and do not go through API Gateway/Lambda/DynamoDB

**AWS Services:** API Gateway, AWS Lambda, DynamoDB (and Cognito for identity-level attributes and for `/settings` actions)

**Validation:**
- Required profile fields validated
- Users may only update their own profile (`userId` derived from the authenticated token, never trusted from client input)

**Edge Cases:**
- Attempt to update another user's profile via direct API call (must be rejected)
- Partial update submissions

**Acceptance Criteria:**
- A student can view and update their own profile information
- Server-side checks prevent modification of another user's profile
- Updated information is reflected across the app after saving

---

## 14. Report Suspicious Listing

**Purpose:** Allow students to flag listings that appear suspicious, fraudulent, or inappropriate for admin review.

**User Story:** As a student, I want to report a suspicious listing so that admins can review and take action if needed.

**Actor:** Student

**Frontend Behavior:**
- `ReportDialog` component accessible from the listing detail page
- Reason selection and optional details field
- Loading, success (confirmation), and error states

**Backend Behavior:**
- Lambda handles `POST /reports`, persisting a report record referencing the listing, reporter, and reason in DynamoDB
- `GET /reports/{id}` used for retrieving report status/detail (primarily for admin use)

**AWS Services:** API Gateway, AWS Lambda, DynamoDB

**Validation:**
- Reason field required
- Listing ID must exist
- Rate limiting/duplicate-report prevention may apply at the backend level

**Edge Cases:**
- Reporting an already-deleted listing
- Duplicate reports from the same user on the same listing
- Reporting one's own listing

**Acceptance Criteria:**
- Students can successfully submit a report tied to a specific listing
- Reports appear in the admin dashboard for review
- Confirmation is shown to the reporting student upon success

---

## 15. Access Admin Dashboard

**Purpose:** Provide administrators a central place to manage the marketplace.

**User Story:** As an admin, I want to access an admin dashboard so that I can oversee and manage the marketplace.

**Actor:** Admin

**Frontend Behavior:**
- `/admin` route, protected and only rendered for users with the ADMIN role
- Overview of users, listings, and reports; navigation to admin sub-sections

**Backend Behavior:**
- Every admin API call verifies the authenticated user's role is ADMIN before executing

**AWS Services:** Amazon Cognito, API Gateway, AWS Lambda, DynamoDB

**Validation:**
- Role verification on every request (`role === ADMIN`)

**Edge Cases:**
- Non-admin user manually navigates to `/admin` (frontend must redirect; backend must independently reject any API calls)
- Admin session expires while on the dashboard

**Acceptance Criteria:**
- Only authenticated users with the ADMIN role can load dashboard data
- Non-admin access attempts are rejected both in the UI and at the API layer
- Dashboard reflects current, accurate marketplace state

---

## 16. Manage Users

**Purpose:** Allow admins to view and manage student accounts.

**User Story:** As an admin, I want to view and manage users so that I can maintain a safe and trustworthy marketplace.

**Actor:** Admin

**Frontend Behavior:**
- `/admin/users` page with an admin table listing users and available actions
- Loading, empty, and error states

**Backend Behavior:**
- Lambda handles `GET /admin/users`, verifying ADMIN role before returning user data
- Lambda handles `PUT /admin/users/{id}`, verifying ADMIN role, for the account-management actions exposed by `UsersTable` (see Feature 20 — Take Administrative Action)

**AWS Services:** API Gateway, AWS Lambda, DynamoDB, Amazon Cognito

**Validation:**
- Role verification (ADMIN only)
- Pagination parameters validated

**Edge Cases:**
- Very large user base requiring pagination
- User data changes between page loads

**Acceptance Criteria:**
- Only admins can retrieve the user list
- User information is displayed clearly and accurately in the admin table
- Non-admin requests are rejected at the API layer

---

## 17. Manage Listings (Admin)

**Purpose:** Allow admins to oversee all marketplace listings, not just their own.

**User Story:** As an admin, I want to view and manage all listings so that I can ensure marketplace content meets platform standards.

**Actor:** Admin

**Frontend Behavior:**
- `/admin/listings` page with an admin table of all listings and moderation actions
- Loading, empty, and error states

**Backend Behavior:**
- Lambda handles `GET /admin/listings`, verifying ADMIN role
- Admin moderation actions call the dedicated `PUT /admin/listings/{id}` endpoint (verifying ADMIN role), which is distinct from the owner-scoped `PUT /listings/{id}` used by sellers editing their own listings

**AWS Services:** API Gateway, AWS Lambda, DynamoDB

**Validation:**
- Role verification (ADMIN only)

**Edge Cases:**
- Large listing volume requiring pagination/filtering
- Listing modified by its owner while an admin is reviewing it

**Acceptance Criteria:**
- Admins can view all marketplace listings regardless of ownership
- Non-admin users cannot access this endpoint
- Listing data displayed is accurate and current

---

## 18. Review Reports

**Purpose:** Allow admins to review reports submitted by students.

**User Story:** As an admin, I want to review submitted reports so that I can decide whether action is needed.

**Actor:** Admin

**Frontend Behavior:**
- `/admin/reports` page listing submitted reports with status and detail views
- Loading, empty, and error states

**Backend Behavior:**
- Lambda handles `GET /admin/reports`, verifying ADMIN role, and `GET /reports/{id}` for report detail
- `PUT /reports/{id}` records the outcome once an admin resolves the report (see Feature 20 — Take Administrative Action)

**AWS Services:** API Gateway, AWS Lambda, DynamoDB

**Validation:**
- Role verification (ADMIN only)
- Report ID must exist

**Edge Cases:**
- Report referencing a listing that has since been deleted
- Multiple reports on the same listing

**Acceptance Criteria:**
- Admins can view a list of submitted reports and drill into detail
- Non-admin users cannot access report data
- Report status is accurately reflected after review

---

## 19. Moderate Marketplace Content

**Purpose:** Allow admins to take content-moderation actions on listings identified as problematic.

**User Story:** As an admin, I want to moderate marketplace content so that the platform stays safe and trustworthy.

**Actor:** Admin

**Frontend Behavior:**
- Moderation controls within `/admin/listings` and `/admin/reports` (e.g., remove, flag)
- Confirmation prompts for destructive actions
- Loading and error states on action submission

**Backend Behavior:**
- Lambda handles `PUT /admin/listings/{id}`, verifies ADMIN role, then updates listing `status` in DynamoDB (e.g., to `REMOVED` or `FLAGGED`)

**AWS Services:** API Gateway, AWS Lambda, DynamoDB

**Validation:**
- Role verification (ADMIN only)
- Valid target listing/report ID

**Edge Cases:**
- Moderation action attempted on an already-removed listing
- Concurrent moderation actions by multiple admins

**Acceptance Criteria:**
- Only admins can perform moderation actions
- Listing status updates are reflected immediately across the marketplace
- Moderation actions are enforced and validated server-side

---

## 20. Take Administrative Action

**Purpose:** Allow admins to act on reports by keeping, removing, or flagging a listing, or acting against an account.

**User Story:** As an admin, I want to take administrative action on a reported listing or account so that I can resolve issues appropriately.

**Actor:** Admin

**Frontend Behavior:**
- Action controls on the report detail view: keep listing, remove listing, flag listing, take action against account
- Confirmation prompts; loading and error states

**Backend Behavior:**
- Lambda verifies ADMIN role and applies the selected action, updating listing and/or user records in DynamoDB as appropriate
- `PUT /reports/{id}` records the resolution; `PUT /admin/listings/{id}` applies a listing-level action (keep/remove/flag); `PUT /admin/users/{id}` applies an account-level action

**AWS Services:** API Gateway, AWS Lambda, DynamoDB

**Validation:**
- Role verification (ADMIN only)
- Valid action type selected

**Edge Cases:**
- Action taken on a report/listing that no longer exists
- Repeated or conflicting actions on the same report

**Acceptance Criteria:**
- Admin actions (keep, remove, flag, account action) are applied correctly and only by authorized admins
- Report status reflects the resulting action
- Actions are auditable through application data and CloudWatch logs

---

## 21. Automated Image Moderation (Rekognition)

**Purpose:** Automatically screen uploaded product images for inappropriate or unsuitable content.

**User Story:** As a platform operator, I want uploaded images automatically screened so that inappropriate content is caught before or shortly after publication.

**Actor:** System (triggered by Student upload)

**Frontend Behavior:**
- No direct UI; the uploader may reflect a "processing" or "flagged" state if surfaced by the backend

**Backend Behavior:**
- After an image lands in S3, an image processing workflow invokes Amazon Rekognition
- Analysis result determines accept/flag outcome, which feeds into the listing workflow

**AWS Services:** S3, Amazon Rekognition, AWS Lambda

**Validation:**
- Only images that pass the analysis workflow (or are appropriately flagged) proceed into the standard listing flow

**Edge Cases:**
- Rekognition analysis failure/timeout
- Borderline content requiring flag rather than outright rejection

**Acceptance Criteria:**
- Every uploaded product image is analyzed via Rekognition
- Flagged images are handled distinctly from accepted images in the listing workflow
- Rekognition remains the only image-analysis service used for this purpose

---

## 22. Listing Expiry Automation (EventBridge)

**Purpose:** Automatically expire listings after their defined lifetime without manual intervention.

**User Story:** As a platform operator, I want listings to expire automatically so that the marketplace stays current and relevant.

**Actor:** System (scheduled)

**Frontend Behavior:**
- Expired listings are excluded from marketplace/search results and shown as "Expired" in the seller's own listings view

**Backend Behavior:**
- EventBridge triggers a scheduled Lambda workflow
- Lambda finds listings past their `expiresAt` timestamp and updates their `status` to `EXPIRED` in DynamoDB
- Triggers a related notification/email workflow (see [Feature 23](#23-transactional-email-notifications-ses))

**AWS Services:** Amazon EventBridge, AWS Lambda, DynamoDB, Amazon SES

**Validation:**
- Only listings whose `expiresAt` has passed and whose status is not already `EXPIRED` are updated

**Edge Cases:**
- Listing edited/renewed right at the expiry boundary
- Scheduled workflow failure or delay (surfaced via CloudWatch)

**Acceptance Criteria:**
- Listings past their expiry timestamp are automatically marked `EXPIRED`
- Expired listings no longer appear in standard marketplace browsing/search
- EventBridge is used only for this kind of scheduled/asynchronous processing, never for synchronous CRUD

---

## 23. Transactional Email Notifications (SES)

**Purpose:** Notify sellers of important events via email, such as listing expiry.

**User Story:** As a seller, I want to receive an email when my listing expires or changes status so that I'm informed even when I'm not on the platform.

**Actor:** System (triggered by EventBridge/Lambda workflows)

**Frontend Behavior:**
- No direct UI; this is a backend-to-inbox notification channel, distinct from in-app notifications

**Backend Behavior:**
- Lambda invokes Amazon SES to send transactional emails (e.g., listing expiry notification, listing status notification, seller notifications, important marketplace notifications)

**AWS Services:** Amazon EventBridge, AWS Lambda, Amazon SES

**Validation:**
- Valid recipient email address (from Cognito/user profile)
- Email content generated only for legitimate, defined trigger events

**Edge Cases:**
- Email delivery failure or bounce
- User with an invalid/unverified email address

**Acceptance Criteria:**
- Sellers receive an email when their listing expires
- SES is used strictly for email delivery and holds no business logic itself
- Email sending failures are observable via CloudWatch
