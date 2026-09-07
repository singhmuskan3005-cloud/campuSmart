# API Documentation

This document defines the REST API contract for CampusMart AI, consistent with the CampusMart AI Final Architecture Specification and `docs/architecture.md`, `docs/features.md`, `docs/pages.md`, and `docs/routing.md`. No endpoints beyond those implied by the specification are introduced. Canonical backend services: **Cognito, API Gateway, Lambda, DynamoDB, S3, Rekognition, EventBridge, SES, CloudWatch.**

---

## API Overview

CampusMart AI exposes a REST API through Amazon API Gateway. The Next.js frontend is the sole consumer. Every request flows:

`Next.js → API Gateway → Lambda → DynamoDB / S3 (as needed)`

Lambda functions are organized by domain (listings, wishlist, profile, messages, notifications, reports, admin, image processing) and each independently verifies identity, role, and (where applicable) ownership before executing. The frontend is never a security boundary — all authorization decisions are authoritative in Lambda, per `docs/architecture.md` (Section 20). Account creation, login, password reset, and sign-out are handled directly against Cognito by the frontend and are **not** part of this REST API surface.

---

## Base URL

```
https://{api-id}.execute-api.{region}.amazonaws.com/{stage}
```

All endpoint paths documented below (e.g. `/listings`) are relative to this base URL. `{stage}` corresponds to the deployed API Gateway stage (e.g. `prod`).

---

## Authentication

- Authentication is handled exclusively by **Amazon Cognito**. The frontend obtains a JWT (ID/access token) on login and attaches it to every REST API request:
  ```
  Authorization: Bearer <token>
  ```
- API Gateway and/or Lambda validate the token's signature, expiration, and issuer before any business logic executes.
- A request with a missing, malformed, or expired token receives `401 Unauthorized`. Per `docs/routing.md` (Section 6), a 401 from any API call triggers the same redirect-to-`/login` behavior as the frontend's own auth guards.
- No endpoint in this document is reachable without a valid Cognito token; there are no anonymous REST endpoints (public pages such as `/`, `/login`, `/signup`, `/forgot-password` do not call this API — they call Cognito directly).

---

## Authorization and RBAC

CampusMart AI defines two mutually exclusive roles, carried as a claim/attribute on the Cognito token: `STUDENT` and `ADMIN`.

Every protected endpoint enforces authorization in Lambda using one or more of the following checks, independent of anything the frontend has hidden or disabled:

| Check | Meaning |
|---|---|
| **Role check** | The authenticated user's role (from the token) must match the role required by the endpoint (`STUDENT` or `ADMIN`). |
| **Ownership check** | For resources scoped to an individual (own listings, own wishlist, own profile, own threads), the resource's owner/participant ID must match the authenticated `userId`. |
| **Participant check** | For message threads, the authenticated user must be one of the thread's two participants. |

A role violation or ownership/participant violation results in `403 Forbidden`, even for actions the UI never exposed. `docs/architecture.md` (Section 6) and `docs/routing.md` (Section 6, Layer 3) both establish that frontend route/UI guarding exists only for user experience — the backend re-verifies identity and role on every call.

---

## Common HTTP Status Codes

| Code | Meaning |
|---|---|
| `200 OK` | Request succeeded |
| `201 Created` | Resource created successfully |
| `400 Bad Request` | Request failed validation |
| `401 Unauthorized` | Missing, invalid, or expired authentication token |
| `403 Forbidden` | Authenticated, but not authorized (wrong role or not the resource owner/participant) |
| `404 Not Found` | Resource does not exist (or is not visible to the requester) |
| `409 Conflict` | Request conflicts with current resource state (e.g. duplicate entry) |
| `500 Internal Server Error` | Unexpected server-side failure |

---

## Common Error Format

All error responses share a single JSON shape:

```json
{
  "error": {
    "code": "STRING_ERROR_CODE",
    "message": "Human-readable description of the error",
    "details": {}
  }
}
```

- `code` is a stable, machine-readable identifier (e.g. `VALIDATION_ERROR`, `NOT_FOUND`, `FORBIDDEN`, `UNAUTHORIZED`).
- `message` is safe to display or log; it never leaks internal implementation detail.
- `details` is optional and typically used for field-level validation errors.

---

## Listings API

### `GET /listings`

**Purpose:** Retrieve active marketplace listings, supporting the browse/search/filter experience on `/marketplace` and the "My Listings" view on `/listings`.

**Authentication:** Required.

**Required Role:** `STUDENT` or `ADMIN` — both roles are permitted to browse/search listings per `docs/architecture.md` (Section 6 — RBAC).

**Ownership Requirement:** None for the general marketplace query. When called with a `sellerId`/"mine" scope (used by the `/listings` page), results are restricted server-side to the authenticated user's own listings — the caller cannot request another user's listings this way. The `mine` scope is meaningful only for `STUDENT` callers, since sellers are students.

**Request Parameters (query string):**
| Param | Type | Required | Notes |
|---|---|---|---|
| `q` | string | No | Search keyword |
| `category` | string | No | Must match a known category |
| `cursor` | string | No | Pagination cursor |
| `limit` | number | No | Page size |
| `mine` | boolean | No | Scopes results to the authenticated user's own listings (powers `/listings`) |

**Request Body:** None.

**Response (200):**
```json
{
  "items": [
    {
      "listingId": "string",
      "sellerId": "string",
      "title": "string",
      "description": "string",
      "price": 0,
      "category": "string",
      "condition": "string",
      "images": ["string"],
      "status": "ACTIVE | EXPIRED | REMOVED | FLAGGED",
      "createdAt": "ISO-8601",
      "expiresAt": "ISO-8601"
    }
  ],
  "nextCursor": "string | null"
}
```

**Status Codes:** `200`, `400` (invalid query params), `401`.

**Validation:** `category` checked against known categories; `q` length-limited; `cursor`/`limit` validated server-side.

**Common Errors:** `400 VALIDATION_ERROR` for malformed query params; expired listings are excluded from the default (non-`mine`) view rather than returned as an error.

---

### `GET /listings/{listingId}`

**Purpose:** Retrieve full details of a single listing for `/marketplace/[listingId]` and to pre-populate `/listings/[listingId]/edit`.

**Authentication:** Required.

**Required Role:** `STUDENT` or `ADMIN` — both roles are permitted to view product details per `docs/architecture.md` (Section 6 — RBAC).

**Ownership Requirement:** None to view (any authenticated student or admin may view any listing). No ownership restriction is applied on read.

**Request Parameters (path):**
| Param | Type | Required | Notes |
|---|---|---|---|
| `listingId` | string | Yes | Listing identifier |

**Request Body:** None.

**Response (200):** Single listing object (same shape as in `GET /listings`).

**Status Codes:** `200`, `400` (malformed `listingId`), `401`, `404` (listing does not exist, was deleted, or has expired/been removed, per `docs/pages.md` not-found behavior).

**Validation:** `listingId` format validated; existence and status checked before returning data.

**Common Errors:** `404 NOT_FOUND` for a deleted/expired/removed listing.

---

### `POST /listings`

**Purpose:** Create a new listing from the `/sell` page.

**Authentication:** Required.

**Required Role:** `STUDENT`.

**Ownership Requirement:** N/A on creation — `sellerId` is derived from the authenticated token, never trusted from client input.

**Request Parameters:** None.

**Request Body:**
```json
{
  "title": "string",
  "description": "string",
  "price": 0,
  "category": "string",
  "condition": "string",
  "images": ["string"]
}
```
`images` contains S3 object references obtained via the Image Upload flow (see [Image Upload](#image-upload)), not raw image bytes.

**Response (201):** The created listing object, including generated `listingId`, `sellerId`, `status: "ACTIVE"`, `createdAt`, and `expiresAt`.

**Status Codes:** `201`, `400` (validation failure), `401`.

**Validation:** `title`, `description`, `price`, `category`, `condition` required; `price` must be a positive number; at least one image may be required per product rules; all validation is re-run server-side independent of client-side checks. Because the S3 upload and Rekognition analysis run asynchronously relative to the upload call (see [Image Upload](#image-upload)), a listing is **not published** until every referenced image has successfully cleared Rekognition moderation — an image that is still unprocessed or has been flagged cannot be published, and the listing creation request is rejected until all referenced images have a passing moderation result.

**Common Errors:** `400 VALIDATION_ERROR` (missing/invalid fields, non-positive price); `400 IMAGE_NOT_READY` if a referenced image has not yet finished Rekognition analysis; `400 IMAGE_FLAGGED` if a referenced image failed moderation and cannot be used.

---

### `PUT /listings/{listingId}`

**Purpose:** Update an existing listing from `/listings/[listingId]/edit`.

**Authentication:** Required.

**Required Role:** `STUDENT`.

**Ownership Requirement:** Only the listing's `sellerId` may edit. Enforced server-side regardless of what the UI allows.

**Request Parameters (path):**
| Param | Type | Required | Notes |
|---|---|---|---|
| `listingId` | string | Yes | Listing identifier |

**Request Body:** Same shape as `POST /listings` (fields being updated); new images go through the same upload/moderation flow as creation.

**Response (200):** The updated listing object.

**Status Codes:** `200`, `400` (validation failure), `401`, `403` (authenticated user is not the owner), `404` (listing does not exist).

**Validation:** Same field validation as creation; ownership check (`sellerId === userId` from token) performed before any update is applied.

**Common Errors:** `403 FORBIDDEN` for a non-owner attempting to edit via direct API call; `404 NOT_FOUND` if the listing was deleted/expired before submission.

---

### `DELETE /listings/{listingId}`

**Purpose:** Remove a listing owned by the authenticated student, from `/listings`.

**Authentication:** Required.

**Required Role:** `STUDENT`.

**Ownership Requirement:** Only the listing's `sellerId` may delete. Enforced server-side.

**Request Parameters (path):**
| Param | Type | Required | Notes |
|---|---|---|---|
| `listingId` | string | Yes | Listing identifier |

**Request Body:** None.

**Response (200):**
```json
{ "listingId": "string", "deleted": true }
```

**Status Codes:** `200`, `401`, `403` (not the owner), `404` (listing does not exist or was already deleted).

**Validation:** Ownership check; `listingId` must exist.

**Common Errors:** `403 FORBIDDEN` for a non-owner attempting deletion via direct API call; `404 NOT_FOUND` for an already-deleted/expired listing.

---

## Wishlist API

### `GET /wishlist`

**Purpose:** Retrieve the authenticated student's saved listings for the `/wishlist` page.

**Authentication:** Required (`STUDENT`). Results are always scoped to the authenticated `userId` — there is no parameter to view another user's wishlist.

**Request:** No query parameters or body required.

**Response (200):**
```json
{
  "items": [
    {
      "listingId": "string",
      "addedAt": "ISO-8601",
      "listing": { "...": "listing summary fields, as in GET /listings" }
    }
  ]
}
```
Entries referencing a since-deleted/expired listing are still returned but flagged (e.g. `listing.status`) so the UI can handle them gracefully.

**Status Codes:** `200`, `401`.

**Validation:** None beyond authentication — results are inherently scoped server-side to the caller.

**Errors:** `401 UNAUTHORIZED` if the token is missing/invalid.

---

### `POST /wishlist`

**Purpose:** Add a listing to the authenticated student's wishlist (`WishlistButton` toggle-on).

**Authentication:** Required (`STUDENT`).

**Request Body:**
```json
{ "listingId": "string" }
```

**Response (201):**
```json
{ "listingId": "string", "addedAt": "ISO-8601" }
```

**Status Codes:** `201`, `400` (missing/invalid `listingId`), `401`, `404` (listing does not exist), `409` (already wishlisted).

**Validation:** `listingId` must exist and reference an active listing; duplicate wishlist entries are rejected/deduplicated server-side.

**Errors:** `404 NOT_FOUND` for a nonexistent listing; `409 CONFLICT` for a duplicate add (or the API may treat this as idempotent — implementation detail, but never silently duplicates a record).

---

### `DELETE /wishlist/{listingId}`

**Purpose:** Remove a listing from the authenticated student's wishlist (`WishlistButton` toggle-off, or the remove action on `/wishlist`).

**Authentication:** Required (`STUDENT`). Ownership is implicit — the wishlist record removed is always the authenticated user's own; a user cannot remove another user's wishlist entry.

**Request Parameters (path):**
| Param | Type | Required | Notes |
|---|---|---|---|
| `listingId` | string | Yes | Listing identifier to remove from the wishlist |

**Response (200):**
```json
{ "listingId": "string", "removed": true }
```

**Status Codes:** `200`, `401`, `404` (listing was not in the caller's wishlist).

**Validation:** The wishlist record must belong to the authenticated user (scoped by `userId` server-side, not by client input).

**Errors:** `404 NOT_FOUND` if no matching wishlist entry exists for this user/listing pair.

---

## Profile API

### `GET /profile`

**Purpose:** Retrieve the authenticated student's profile information for the `/profile` page.

**Authentication:** Required (`STUDENT`). Always scoped to the authenticated `userId`.

**Request:** No parameters or body required.

**Response (200):**
```json
{
  "userId": "string",
  "email": "string",
  "name": "string",
  "role": "STUDENT",
  "profile": { "...": "additional profile fields" },
  "createdAt": "ISO-8601"
}
```

**Status Codes:** `200`, `401`.

**Errors:** `401 UNAUTHORIZED` if the token is missing/invalid.

---

### `PUT /profile`

**Purpose:** Update the authenticated student's own profile from the `/profile` page.

**Authentication:** Required (`STUDENT`). `userId` is always derived from the token, never accepted from the request body — a user cannot update another user's profile.

**Request Body:**
```json
{
  "name": "string",
  "profile": { "...": "editable profile fields" }
}
```

**Response (200):** The updated profile object (same shape as `GET /profile`).

**Status Codes:** `200`, `400` (validation failure), `401`, `403` (attempt to target a `userId` other than the caller's — rejected even if present in the payload).

**Validation:** Required profile fields validated; partial updates allowed for defined optional fields.

**Errors:** `400 VALIDATION_ERROR` for invalid field values; `403 FORBIDDEN` if a client attempts to modify another user's profile.

### Cognito vs. DynamoDB Data

Per `docs/architecture.md` (Section 5, Section 9) and `docs/features.md` (Feature 13):

- **Amazon Cognito** owns identity-level data used for authentication: the account's `email` (as the login identifier), password, email-verification status, and the `role` claim used for RBAC. Password changes and sign-out (on `/settings`) are performed directly against Cognito by the frontend and do not go through this REST API.
- **Amazon DynamoDB** (via `GET /profile` / `PUT /profile`) owns the application-level profile record: `userId`, `name`, and other editable profile fields, plus `createdAt`. `email` and `role` are echoed from the Cognito-authenticated token/identity rather than being independently editable through `PUT /profile`.

`/settings` has no dedicated backend API of its own (no API Gateway/Lambda/DynamoDB involvement) — it is Cognito-only, consistent with `docs/pages.md` (Settings) and `docs/routing.md`.

---

## Messages API

Messaging is synchronous REST (`Next.js → API Gateway → Lambda → DynamoDB`), consistent with `docs/architecture.md` — no WebSockets, SNS, or EventBridge are used for message delivery.

### `GET /messages`

**Purpose:** Retrieve the authenticated student's list of message threads for the `/messages` page.

**Authentication:** Required (`STUDENT`). Results are always scoped to threads the authenticated user participates in.

**Request:** No parameters or body required.

**Response (200):**
```json
{
  "threads": [
    {
      "threadId": "string",
      "listingId": "string",
      "participants": ["string", "string"],
      "lastMessage": { "senderId": "string", "content": "string", "sentAt": "ISO-8601" },
      "updatedAt": "ISO-8601"
    }
  ]
}
```

**Status Codes:** `200`, `401`.

**Errors:** `401 UNAUTHORIZED` if the token is missing/invalid.

---

### `POST /messages`

**Purpose:** Create a new message thread — the minimum endpoint required for "Contact Seller" on `/marketplace/[listingId]` when no thread with that seller/listing already exists (`docs/features.md`, Feature 11; `docs/pages.md`, Listing Detail).

**Authentication:** Required (`STUDENT`).

**Participant Authorization:** The authenticated user becomes one participant; the listing's `sellerId` becomes the other. A user cannot open a thread naming themselves as both participants (cannot message their own listing).

**Request Body:**
```json
{ "listingId": "string", "message": "string" }
```

**Response (201):** The created thread, including `threadId`, and the first message.

**Status Codes:** `201`, `400` (empty/oversized message, or self-messaging attempt), `401`, `404` (listing does not exist).

**Validation:** Message content required and length-limited; sender must not be the listing's own seller.

**Errors:** `400 VALIDATION_ERROR` for empty message or self-messaging; `404 NOT_FOUND` for a nonexistent/deleted listing.

---

### `GET /messages/{threadId}`

**Purpose:** Retrieve a thread's message history for `/messages/[threadId]`.

**Authentication:** Required (`STUDENT`).

**Participant Authorization:** Only the two thread participants may retrieve the thread; enforced server-side.

**Request Parameters (path):**
| Param | Type | Required | Notes |
|---|---|---|---|
| `threadId` | string | Yes | Thread identifier |

**Response (200):**
```json
{
  "threadId": "string",
  "listingId": "string",
  "participants": ["string", "string"],
  "messages": [
    { "messageId": "string", "senderId": "string", "content": "string", "sentAt": "ISO-8601" }
  ]
}
```

**Status Codes:** `200`, `401`, `403` (authenticated user is not a participant), `404` (thread does not exist).

**Errors:** `403 FORBIDDEN` for a non-participant; `404 NOT_FOUND` for a nonexistent thread.

---

### `POST /messages/{threadId}`

**Purpose:** Send a message within an existing thread from `/messages/[threadId]`.

**Authentication:** Required (`STUDENT`).

**Participant Authorization:** Only a participant of `threadId` may post to it; enforced server-side.

**Request Parameters (path):**
| Param | Type | Required | Notes |
|---|---|---|---|
| `threadId` | string | Yes | Thread identifier |

**Request Body:**
```json
{ "content": "string" }
```

**Response (201):**
```json
{ "messageId": "string", "senderId": "string", "content": "string", "sentAt": "ISO-8601" }
```

**Status Codes:** `201`, `400` (empty/oversized content), `401`, `403` (not a participant), `404` (thread does not exist).

**Validation:** Message content required and length-limited.

**Errors:** `400 VALIDATION_ERROR` for empty content; `403 FORBIDDEN` for a non-participant; `404 NOT_FOUND` for a nonexistent thread.

---

## Notifications API

Notifications are stored in DynamoDB and written by documented Lambda workflows as relevant events occur (new message, listing status change, listing expiry). No SNS or WebSocket delivery is used — the frontend retrieves notifications via REST.

### `GET /notifications`

**Purpose:** Retrieve the authenticated student's notifications for the `/notifications` page.

**Authentication:** Required (`STUDENT`).

**User Ownership:** Results are strictly scoped to the authenticated `userId` — a user can never retrieve another user's notifications.

**Request:** No parameters or body required (pagination parameters may be supported for large volumes).

**Response (200):**
```json
{
  "items": [
    {
      "notificationId": "string",
      "type": "NEW_MESSAGE | LISTING_STATUS | LISTING_EXPIRY",
      "content": "string",
      "relatedId": "string",
      "read": false,
      "createdAt": "ISO-8601"
    }
  ]
}
```

**Status Codes:** `200`, `401`.

**Errors:** `401 UNAUTHORIZED` if the token is missing/invalid.

---

### `PUT /notifications/{notificationId}/read`

**Purpose:** Mark a notification as read, fired when a student opens/clicks a notification on `/notifications` (`docs/pages.md`, Notifications; `docs/features.md`, Feature 12).

**Authentication:** Required (`STUDENT`).

**User Ownership:** Only the owner of the notification may mark it read; enforced server-side by matching `userId` from the token against the notification record.

**Request Parameters (path):**
| Param | Type | Required | Notes |
|---|---|---|---|
| `notificationId` | string | Yes | Notification identifier |

**Request Body:** None.

**Response (200):**
```json
{ "notificationId": "string", "read": true }
```

**Status Codes:** `200`, `401`, `403` (notification belongs to a different user), `404` (notification does not exist).

**Errors:** `403 FORBIDDEN` for a non-owner attempting to mark another user's notification read; `404 NOT_FOUND` for a nonexistent notification.

---

## Reports API

### `POST /reports`

**Purpose:** Submit a report against a suspicious/fraudulent/inappropriate listing, from the `ReportDialog` on the listing detail page (`docs/features.md`, Feature 14).

**Authentication:** Required.

**Student Permissions:** Any authenticated `STUDENT` may submit a report; `reporterId` is derived from the token, never trusted from client input.

**Request Body:**
```json
{
  "listingId": "string",
  "reason": "string",
  "details": "string"
}
```

**Response (201):**
```json
{
  "reportId": "string",
  "listingId": "string",
  "reporterId": "string",
  "reason": "string",
  "status": "OPEN",
  "createdAt": "ISO-8601"
}
```

**Status Codes:** `201`, `400` (missing reason / invalid listing reference), `401`, `404` (listing does not exist).

**Validation:** `reason` required; `listingId` must exist; duplicate-report/rate-limiting may be applied server-side per user/listing pair.

**Errors:** `400 VALIDATION_ERROR` for a missing reason; `404 NOT_FOUND` for a nonexistent/deleted listing.

---

## Admin API

Every endpoint in this section requires **authentication + the `ADMIN` role**, independently verified in Lambda on each call. As established in `docs/architecture.md` (Section 6, Section 19) and `docs/routing.md` (Section 6), the `(admin)` route group's frontend layout guard exists purely for UX — it prevents flashes of unauthorized content and gives immediate redirects, but it is **not** the security boundary. A student calling any `/admin/*` endpoint directly, bypassing the UI entirely, is independently rejected server-side with `403 Forbidden`.

### `GET /admin/users`

**Purpose:** List user accounts for `/admin/users`.

**Authentication + Role:** Required; `ADMIN` only.

**Request Parameters (query string):** `cursor`, `limit` for pagination.

**Response (200):**
```json
{
  "items": [
    { "userId": "string", "email": "string", "name": "string", "role": "STUDENT | ADMIN", "status": "ACTIVE | SUSPENDED", "createdAt": "ISO-8601" }
  ],
  "nextCursor": "string | null"
}
```

**Status Codes:** `200`, `401`, `403` (non-admin caller).

---

### `PUT /admin/users/{userId}`

**Purpose:** Apply an account-level administrative action (e.g. suspend/reinstate) exposed by `UsersTable`, per `docs/features.md` (Feature 16, Feature 20).

**Authentication + Role:** Required; `ADMIN` only.

**Request Parameters (path):** `userId` (required).

**Request Body:**
```json
{ "action": "SUSPEND | REINSTATE", "reason": "string" }
```

**Response (200):** Updated user record.

**Status Codes:** `200`, `400` (invalid action), `401`, `403` (non-admin caller), `404` (user does not exist).

**Validation:** `action` must be a recognized value; role verification (`ADMIN` only).

---

### `GET /admin/listings`

**Purpose:** List all marketplace listings, regardless of seller, for `/admin/listings`.

**Authentication + Role:** Required; `ADMIN` only.

**Request Parameters (query string):** `cursor`, `limit`, optional filters (e.g. `status`).

**Response (200):** Same listing shape as `GET /listings`, paginated, unfiltered by ownership.

**Status Codes:** `200`, `401`, `403` (non-admin caller).

---

### `PUT /admin/listings/{listingId}`

**Purpose:** Apply a moderation action (keep, remove, flag) to any listing, per `docs/features.md` (Feature 17, Feature 19, Feature 20). This is a distinct, admin-only endpoint from the owner-scoped `PUT /listings/{listingId}` used by sellers — ownership rules never apply here, since only `ADMIN`-role requests are authorized to call it.

**Authentication + Role:** Required; `ADMIN` only.

**Request Parameters (path):** `listingId` (required).

**Request Body:**
```json
{ "action": "KEEP | REMOVE | FLAG" }
```

**Response (200):** Updated listing record with new `status`.

**Status Codes:** `200`, `400` (invalid action), `401`, `403` (non-admin caller), `404` (listing does not exist).

**Validation:** `action` must be a recognized value; role verification (`ADMIN` only); target listing must exist.

---

### `GET /admin/reports`

**Purpose:** List submitted reports for `/admin/reports`.

**Authentication + Role:** Required; `ADMIN` only.

**Request Parameters (query string):** `cursor`, `limit`, optional `status` filter.

**Response (200):**
```json
{
  "items": [
    { "reportId": "string", "listingId": "string", "reporterId": "string", "reason": "string", "status": "OPEN | RESOLVED", "createdAt": "ISO-8601" }
  ],
  "nextCursor": "string | null"
}
```

**Status Codes:** `200`, `401`, `403` (non-admin caller).

---

### `PUT /reports/{reportId}`

**Purpose:** Record the resolution of a report once an admin takes action (keep, remove, flag, or act on the account), per `docs/features.md` (Feature 18, Feature 20). Listed here alongside the other admin mutation endpoints because it is only reachable by `ADMIN` callers, even though its path lives under `/reports`.

**Authentication + Role:** Required; `ADMIN` only.

**Request Parameters (path):** `reportId` (required).

**Request Body:**
```json
{ "status": "RESOLVED", "resolution": "string" }
```

**Response (200):** Updated report record.

**Status Codes:** `200`, `400` (invalid resolution), `401`, `403` (non-admin caller), `404` (report does not exist).

**Validation:** Role verification (`ADMIN` only); `reportId` must exist; a resolved report reflects the associated listing/account action taken via `PUT /admin/listings/{listingId}` and/or `PUT /admin/users/{userId}`.

---

## Image Upload

Per `docs/architecture.md` (Section 10) and `docs/features.md` (Feature 7), raw image bytes are never proxied through Lambda and never stored in DynamoDB — only image references are. The flow is:

`Next.js → POST /uploads/images → Lambda → presigned S3 upload → S3 → Rekognition → APPROVED or FLAGGED → POST /listings → Lambda verifies image approval → DynamoDB`

The S3 upload step is **asynchronous**: `POST /uploads/images` returns the presigned upload target immediately and does not wait for the browser to finish uploading or for Rekognition to finish analyzing. A listing cannot become `ACTIVE` until every image it references has reached an `APPROVED` Rekognition result — see the Rekognition Entry Point below and the Validation notes under [Listings API](#listings-api).

### `POST /uploads/images`

**Purpose:** Request a secure, scoped upload mechanism (e.g. a pre-signed S3 request) so the browser can upload an image directly to S3, used by `ImageUploader` on `/sell` and `/listings/[listingId]/edit`.

**Authentication:** Required (`STUDENT`).

**Request Body:**
```json
{ "fileName": "string", "contentType": "string", "fileSize": 0 }
```

**Response (201):**
```json
{
  "uploadUrl": "string",
  "uploadFields": { "...": "any fields required by the pre-signed request" },
  "objectKey": "string",
  "expiresIn": 0
}
```

**Status Codes:** `201`, `400` (disallowed file type or oversized file), `401`.

**Allowed File Types:** Standard image formats only (e.g. `image/jpeg`, `image/png`, `image/webp`). Any other `contentType` is rejected with `400`.

**Size Validation:** A maximum per-image file size is enforced server-side before an upload mechanism is issued; a request exceeding the limit is rejected with `400` before any S3 interaction occurs. A maximum number of images per listing is also enforced (checked at `POST /listings` / `PUT /listings/{listingId}` submission time).

**Upload Flow:**
1. Frontend calls `POST /uploads/images` with file metadata.
2. Lambda validates type/size limits and issues a scoped, time-limited presigned S3 upload (e.g. pre-signed POST/PUT) targeting a private S3 bucket — the bucket is never publicly writable.
3. Frontend uploads the image bytes directly to S3 using the presigned upload (bytes never pass through Lambda). This step is asynchronous — the frontend may continue filling out the listing form while the upload and analysis proceed in the background.
4. Once the object lands in S3, an image-processing workflow invokes Amazon Rekognition, which resolves the image to `APPROVED` or `FLAGGED`.
5. Frontend submits the listing (`POST /listings` or `PUT /listings/{listingId}`) referencing the returned `objectKey`(s) — only the reference is stored in DynamoDB, never the image bytes.
6. Lambda verifies, at listing-submission time, that every referenced `objectKey` has an `APPROVED` Rekognition result before persisting the listing to DynamoDB and allowing it to become `ACTIVE`.

**S3 Object Key:** Keys are scoped and namespaced per uploader/listing to prevent collisions and unauthorized overwrites (e.g. including the authenticated `userId` and a generated identifier); the exact key scheme is an implementation detail of the upload-issuing Lambda, but it is never client-specified in a way that could overwrite another user's object.

**Security Considerations:**
- The S3 bucket is private; objects are not publicly readable or writable outside the controlled upload/serving mechanisms.
- The issued upload mechanism is short-lived and scoped to a single object key, preventing reuse to upload arbitrary or unrelated files.
- File type and size are validated both before issuing the upload mechanism and again as part of the image-processing workflow after upload.
- Access to view images is mediated by the backend/listing data, not by guessable public S3 URLs.

**Rekognition Entry Point:** The direct browser-to-S3 upload (step 3 above) is **asynchronous** with respect to the rest of the flow — `POST /uploads/images` returns immediately with the presigned upload and does not wait for the image bytes to actually land in S3. Once the image does land in S3, an image-processing workflow (triggered on S3 object creation) invokes Amazon Rekognition to analyze it, per `docs/architecture.md` (Section 11) and `docs/features.md` (Feature 21). The analysis resolves each `objectKey` to `APPROVED` or `FLAGGED`.

A listing cannot become `ACTIVE` until every image it references has an `APPROVED` Rekognition result:
- An `objectKey` with no recorded result yet (upload still in flight, or analysis not yet complete) is treated as **unprocessed** and cannot be used.
- An `objectKey` that Rekognition has resolved to `FLAGGED` cannot be used.
- At `POST /listings` (and `PUT /listings/{listingId}` when images change), Lambda verifies every referenced `objectKey` is `APPROVED` before persisting the listing to DynamoDB; only then does the listing become `ACTIVE`. See the Validation notes under [Listings API](#listings-api).

**Common Errors:** `400 VALIDATION_ERROR` for a disallowed content type or oversized file; `401 UNAUTHORIZED` for a missing/invalid token. A listing submission referencing an image that is unprocessed or `FLAGGED` surfaces as `400 IMAGE_NOT_READY` / `400 IMAGE_FLAGGED` from `POST /listings` (or `PUT /listings/{listingId}`), not as an error from this endpoint itself.
