# Database Documentation

This document defines the authoritative Amazon DynamoDB design for CampusMart AI, derived strictly from `docs/architecture.md`, `docs/features.md`, and `docs/api.md`. No architecture is redesigned here — this document translates the already-documented REST API access patterns into concrete DynamoDB tables, keys, and indexes. Canonical database: **Amazon DynamoDB**. Canonical services: **Cognito, API Gateway, Lambda, DynamoDB, S3, Rekognition, EventBridge, SES, CloudWatch.** No relational database, document database, cache, or search service (RDS, MySQL, PostgreSQL, MongoDB, Redis, OpenSearch, ElastiCache, or any other) is introduced.

---

## Table of Contents

1. [Database Overview](#1-database-overview)
2. [Why DynamoDB](#2-why-dynamodb)
3. [Table Strategy](#3-table-strategy)
4. [Users Data Model](#4-users-data-model)
5. [Listings Data Model](#5-listings-data-model)
6. [Wishlist Data Model](#6-wishlist-data-model)
7. [Messages/Threads Data Model](#7-messagesthreads-data-model)
8. [Notifications Data Model](#8-notifications-data-model)
9. [Reports Data Model](#9-reports-data-model)
10. [Partition Key Strategy](#10-partition-key-strategy)
11. [Sort Key Strategy](#11-sort-key-strategy)
12. [Required GSIs](#12-required-gsis)
13. [Access Patterns](#13-access-patterns)
14. [Listing Lifecycle](#14-listing-lifecycle)
15. [Image/S3 Relationship](#15-images3-relationship)
16. [Rekognition Moderation Metadata](#16-rekognition-moderation-metadata)
17. [Admin Access Patterns](#17-admin-access-patterns)
18. [Security and Authorization](#18-security-and-authorization)
19. [EventBridge Interaction with Expired Listings](#19-eventbridge-interaction-with-expired-listings)
20. [Important DynamoDB Query Patterns](#20-important-dynamodb-query-patterns)
21. [Data Validation](#21-data-validation)
22. [Error/Edge Cases](#22-erroredge-cases)
23. [Database Interview Questions](#23-database-interview-questions)

---

## 1. Database Overview

DynamoDB is the sole system of record for CampusMart AI's application data (`docs/architecture.md`, Section 9). Every read and write is performed by a domain-scoped Lambda function — the Next.js frontend never talks to DynamoDB directly (`docs/architecture.md`, Section 4). Seven logical entities back the REST surface defined in `docs/api.md`: **Users, Listings, Image Uploads (Rekognition moderation state), Wishlist, Messages/Threads, Notifications, and Reports.** Amazon Cognito remains solely responsible for authentication and identity; DynamoDB stores only application-level data (profile fields, listings, wishlist entries, messages, notifications, reports, and image moderation state). Raw image bytes are never stored in DynamoDB — only S3 object references and their Rekognition moderation status.

---

## 2. Why DynamoDB

Per `docs/architecture.md` (Section 1, Section 9, Section 21):

- CampusMart AI is serverless end-to-end; DynamoDB is the only data store consistent with that model (no server/connection-pool management, pay-per-use, auto-scaling).
- Every access pattern required by `docs/api.md` is a lookup or a narrow range query keyed by a known identifier (`listingId`, `userId`, `threadId`, `notificationId`, `reportId`) or a small, well-understood filtered list (active listings, a user's own listings, a user's own threads) — exactly the shape DynamoDB is built for.
- Marketplace search/filter is explicitly scoped to "DynamoDB-supported access patterns appropriate to the project's expected scale" (`docs/architecture.md`, Section 13) — no external search service (OpenSearch) is introduced.
- A single-digit set of Lambda functions, each with narrow IAM permissions, maps cleanly onto a small set of purpose-built tables rather than a shared relational schema.

---

## 3. Table Strategy

CampusMart AI uses **one DynamoDB table per entity domain** (Users, Listings, Image Uploads, Wishlist, Messages, Notifications, Reports) rather than a single shared table.

**Why not one mega-table (classic DynamoDB single-table design)?**
Single-table design earns its complexity when an application needs to fetch many heterogeneous, related entities in one request at very large scale. CampusMart AI's access patterns (per `docs/api.md`) are already cleanly partitioned by domain — no endpoint requires fetching a listing, a wishlist entry, and a message thread in a single query. Lambda functions are already organized by domain (`docs/architecture.md`, Section 8: listing, wishlist, report, message, admin, image-processing, notification, expiry functions), so one table per domain keeps IAM least-privilege scoping simple (each Lambda's role touches only the table(s) its domain needs) and keeps each table's key design legible on its own.

**Within each table**, related item types (e.g. a thread's metadata, participants, and messages) share a partition key and are distinguished by sort-key prefix — this is the one place a lightweight "single-table" pattern is used, and only because those items are always read together.

Seven tables: `Users`, `Listings`, `ImageUploads`, `Wishlist`, `Messages`, `Notifications`, `Reports`.

**ID convention:** every generated identifier (`listingId`, `messageId`, `notificationId`, `reportId`, `threadId`, `userId`) is a time-sortable unique ID (e.g. ULID/KSUID). This means lexicographic sort-key ordering is also chronological ordering, without needing a separate timestamp field baked into every key.

---

## 4. Users Data Model

**Purpose:** Backs `GET /profile`, `PUT /profile`, `GET /admin/users`, `PUT /admin/users/{userId}`.

| Field | Value |
|---|---|
| **PK** | `USER#{userId}` |
| **SK** | *(none — simple primary key)* |
| **Attributes** | `userId`, `email` (mirrored from Cognito, read-only via this API), `name`, `role` (`STUDENT` \| `ADMIN`), `profile` (map of editable fields), `status` (`ACTIVE` \| `SUSPENDED`), `createdAt` |
| **GSI1 — `AdminUserIndex`** | PK: `"USER"` (constant) · SK: `userId` |

**Access patterns supported:**
- `GET /profile` / `PUT /profile` → `GetItem`/`UpdateItem` on `PK = USER#{userId}` (userId from the Cognito token, never client input).
- `GET /admin/users` → `Query` on `GSI1` with `PK = "USER"`, paginated, ordered by `userId` (time-sortable) — replaces a `Scan` with a `Query`.
- `PUT /admin/users/{userId}` (suspend/reinstate) → `UpdateItem` on `PK = USER#{userId}` setting `status`.

Note on Cognito vs. DynamoDB: `email` and `role` are identity-level facts owned by Cognito and only echoed here for convenient reads; `PUT /profile` never allows the client to modify `email` or `role` through this table (per `docs/api.md`, Profile API).

---

## 5. Listings Data Model

**Purpose:** Backs `GET /listings`, `GET /listings/{listingId}`, `POST /listings`, `PUT /listings/{listingId}`, `DELETE /listings/{listingId}`, `GET /admin/listings`, `PUT /admin/listings/{listingId}`.

| Field | Value |
|---|---|
| **PK** | `LISTING#{listingId}` |
| **SK** | *(none — simple primary key)* |
| **Attributes** | `listingId`, `sellerId`, `title`, `description`, `price`, `category`, `condition`, `images` (list of `{objectKey, status}` — see [Section 15](#15-images3-relationship)), `status` (`ACTIVE` \| `EXPIRED` \| `REMOVED` \| `FLAGGED`), `createdAt`, `expiresAt`, `updatedAt` |
| **GSI1 — `StatusExpiryIndex`** | PK: `status` · SK: `expiresAt` |
| **GSI2 — `SellerIndex`** | PK: `sellerId` · SK: `listingId` |

**Access patterns supported:**
- `GET /listings/{listingId}` → `GetItem` on `PK = LISTING#{listingId}`.
- `GET /listings` (marketplace browse, default) → `Query` on `GSI1` with `PK = "ACTIVE"`, optional `FilterExpression` for `category`/keyword (`q`); this is a filtered `Query`, never a `Scan`, consistent with `docs/architecture.md` (Section 13).
- `GET /listings?mine=true` (My Listings) → `Query` on `GSI2` with `PK = sellerId` (from token).
- `POST /listings` → `PutItem` on `PK = LISTING#{listingId}` after Lambda verifies every referenced image is `APPROVED` (see [Section 16](#16-rekognition-moderation-metadata)); `sellerId` derived from token.
- `PUT /listings/{listingId}` → `GetItem` to confirm `sellerId === userId`, then `UpdateItem`.
- `DELETE /listings/{listingId}` → `GetItem` to confirm ownership, then `DeleteItem` (hard delete — see [Section 14](#14-listing-lifecycle)).
- `GET /admin/listings` → `Query` on `GSI1` per requested `status` filter (or fan out across the four known status values when no filter is given — never a table `Scan`).
- `PUT /admin/listings/{listingId}` → `UpdateItem` on `PK = LISTING#{listingId}` setting `status` to `REMOVED`/`FLAGGED`/`ACTIVE` (keep).

---

## 6. Wishlist Data Model

**Purpose:** Backs `GET /wishlist`, `POST /wishlist`, `DELETE /wishlist/{listingId}`.

| Field | Value |
|---|---|
| **PK** | `USER#{userId}` |
| **SK** | `LISTING#{listingId}` |
| **Attributes** | `userId`, `listingId`, `addedAt` |
| **GSI** | None required |

**Access patterns supported:**
- `GET /wishlist` → `Query` on `PK = USER#{userId}` returns every saved listing reference for that user in one call.
- `POST /wishlist` → `PutItem` with `ConditionExpression: attribute_not_exists(PK)` to prevent duplicate entries (maps directly to the documented `409` on duplicate add).
- `DELETE /wishlist/{listingId}` → `DeleteItem` on `PK = USER#{userId}, SK = LISTING#{listingId}` — a direct point delete, no query required.
- The corresponding listing's current data (title, price, status) is resolved with a follow-up `GetItem` on the `Listings` table per entry (or `BatchGetItem` for the full wishlist page in one round trip).

---

## 7. Messages/Threads Data Model

**Purpose:** Backs `GET /messages`, `POST /messages`, `GET /messages/{threadId}`, `POST /messages/{threadId}`. Synchronous REST only — `Next.js → API Gateway → Lambda → DynamoDB`, no WebSockets.

A single table holds three item types under a shared `threadId` partition:

| Item Type | PK | SK | Attributes |
|---|---|---|---|
| Thread metadata | `THREAD#{threadId}` | `METADATA` | `threadId`, `listingId`, `createdAt`, `updatedAt`, `lastMessage` (snippet) |
| Participant record (one per participant) | `THREAD#{threadId}` | `PARTICIPANT#{userId}` | `threadId`, `userId`, `updatedAt`, `otherParticipantId`, `listingId`, `lastMessage` (denormalized for inbox display) |
| Message | `THREAD#{threadId}` | `MSG#{messageId}` | `messageId`, `senderId`, `content`, `sentAt` |

| **GSI1 — `ParticipantInboxIndex`** | PK: `userId` (sparse — only present on `PARTICIPANT#{userId}` items) · SK: `updatedAt` |
|---|---|

**Access patterns supported:**
- `GET /messages` (list my threads) → `Query` on `GSI1` with `PK = userId` (from token), sorted by `updatedAt` descending — returns one denormalized row per thread the user participates in, no join required.
- `POST /messages` (start a thread) → Lambda verifies the caller is not the listing's own `sellerId`, then a `TransactWriteItems` call creates the `METADATA` item plus two `PARTICIPANT#{userId}` items (one per participant) and the first `MSG#{messageId}` item.
- `GET /messages/{threadId}` → Lambda authorizes with `GetItem` on `PK = THREAD#{threadId}, SK = PARTICIPANT#{callerUserId}` (existence = participant), then `Query` on `PK = THREAD#{threadId}, SK begins_with "MSG#"` for the full message history, chronologically ordered (message IDs are time-sortable).
- `POST /messages/{threadId}` (send message) → same participant check, then `PutItem` for the new `MSG#{messageId}` plus `UpdateItem` on the `METADATA` item and both `PARTICIPANT` items to refresh `lastMessage`/`updatedAt` (small, bounded fan-out — never more than 3 writes).

---

## 8. Notifications Data Model

**Purpose:** Backs `GET /notifications`, `PUT /notifications/{notificationId}/read`.

| Field | Value |
|---|---|
| **PK** | `USER#{userId}` |
| **SK** | `NOTIF#{notificationId}` (`notificationId` is time-sortable, so SK order is chronological order) |
| **Attributes** | `notificationId`, `type` (`NEW_MESSAGE` \| `LISTING_STATUS` \| `LISTING_EXPIRY`), `content`, `relatedId`, `read` (boolean), `createdAt` |
| **GSI** | None required |

**Access patterns supported:**
- `GET /notifications` → `Query` on `PK = USER#{userId}` (results already chronologically ordered by SK; `ScanIndexForward: false` for newest-first).
- `PUT /notifications/{notificationId}/read` → `UpdateItem` on `PK = USER#{userId}, SK = NOTIF#{notificationId}` setting `read = true`. Because the `userId` used in the key always comes from the authenticated token (never the path), a caller can never target another user's notification even if they know its ID — a mismatched `PK` simply produces a `404`.
- Notification records are written by the domain Lambdas that generate the underlying event (new message, listing status change, listing expiry) — never by the frontend directly.

---

## 9. Reports Data Model

**Purpose:** Backs `POST /reports`, `GET /admin/reports`, `PUT /reports/{reportId}`.

| Field | Value |
|---|---|
| **PK** | `REPORT#{reportId}` |
| **SK** | *(none — simple primary key)* |
| **Attributes** | `reportId`, `listingId`, `reporterId`, `reason`, `details`, `status` (`OPEN` \| `RESOLVED`), `resolution`, `createdAt` |
| **GSI1 — `StatusIndex`** | PK: `status` · SK: `reportId` |

**Access patterns supported:**
- `POST /reports` → `PutItem` on `PK = REPORT#{reportId}`; `reporterId` from token.
- `GET /admin/reports` → `Query` on `GSI1` with `PK = status` when a status filter is supplied, or a two-way fan-out across `OPEN`/`RESOLVED` (only two known values) when unfiltered — never a `Scan`.
- `PUT /reports/{reportId}` → `UpdateItem` on `PK = REPORT#{reportId}` setting `status = RESOLVED` and `resolution`; the associated listing/account action itself is a separate write to the `Listings`/`Users` tables via `PUT /admin/listings/{listingId}` / `PUT /admin/users/{userId}`, per `docs/api.md`.
- Report review in the admin UI resolves the referenced listing's current detail with a follow-up `GetItem` on `Listings` by `listingId` — no denormalization needed since this is a single extra point read.

---

## 10. Partition Key Strategy

| Table | Partition Key | Rationale |
|---|---|---|
| Users | `USER#{userId}` | Every documented access pattern for a specific user (profile, admin suspend) is keyed by `userId`. |
| Listings | `LISTING#{listingId}` | Every direct listing read/write (`GET/PUT/DELETE /listings/{id}`) is keyed by `listingId`. |
| ImageUploads | `IMAGE#{objectKey}` | Moderation status is looked up per S3 object key at listing-submission time. |
| Wishlist | `USER#{userId}` | The wishlist is inherently owned by, and always fetched by, one user. |
| Messages | `THREAD#{threadId}` | All message/thread reads (`GET/POST /messages/{threadId}`) are scoped to one thread. |
| Notifications | `USER#{userId}` | Notifications are always fetched/mutated in the scope of the authenticated user. |
| Reports | `REPORT#{reportId}` | `PUT /reports/{reportId}` and report detail resolution are keyed by `reportId`. |

Every partition key that scopes a resource to an individual (`USER#{userId}`) is set from the authenticated Cognito token in Lambda — never from client-supplied input — which is what makes ownership enforcement structural rather than just a validation check (see [Section 18](#18-security-and-authorization)).

---

## 11. Sort Key Strategy

| Table | Sort Key | Rationale |
|---|---|---|
| Users | *(none)* | One item per user; no natural range query within a single user. |
| Listings | *(none)* | One item per listing; range queries happen on GSIs, not the base table. |
| ImageUploads | *(none)* | One item per `objectKey`. |
| Wishlist | `LISTING#{listingId}` | Enables a direct point `DeleteItem` for `DELETE /wishlist/{listingId}` without a query, and a full-partition `Query` for `GET /wishlist`. |
| Messages | `METADATA` / `PARTICIPANT#{userId}` / `MSG#{messageId}` | Lets thread metadata, participant records, and messages coexist under one partition and be filtered by SK prefix (`begins_with`) in a single `Query`. |
| Notifications | `NOTIF#{notificationId}` | Time-sortable `notificationId` gives chronological ordering "for free" while also being the exact key needed for `PUT /notifications/{notificationId}/read`. |
| Reports | *(none)* | One item per report; browsing happens through `GSI1`. |

---

## 12. Required GSIs

Every GSI below exists because a specific, documented `docs/api.md` endpoint has no efficient base-table access path — none are speculative.

| Table | GSI | Keys | Endpoint(s) it serves |
|---|---|---|---|
| Users | `AdminUserIndex` | PK `"USER"` (constant) · SK `userId` | `GET /admin/users` |
| Listings | `StatusExpiryIndex` | PK `status` · SK `expiresAt` | `GET /listings` (browse), `GET /admin/listings` (filter), EventBridge expiry scan |
| Listings | `SellerIndex` | PK `sellerId` · SK `listingId` | `GET /listings?mine=true` |
| Messages | `ParticipantInboxIndex` | PK `userId` (sparse) · SK `updatedAt` | `GET /messages` |
| Reports | `StatusIndex` | PK `status` · SK `reportId` | `GET /admin/reports` |

No GSI is defined for `Wishlist`, `Notifications`, or `ImageUploads` — every access pattern against those tables is already satisfiable from the base table's primary key.

---

## 13. Access Patterns

| # | Access Pattern | Endpoint | Operation |
|---|---|---|---|
| 1 | Get one listing | `GET /listings/{listingId}` | `GetItem` (Listings, base) |
| 2 | Browse active listings, optional category/keyword | `GET /listings` | `Query` (Listings, `StatusExpiryIndex`) |
| 3 | List my own listings | `GET /listings?mine=true` | `Query` (Listings, `SellerIndex`) |
| 4 | Create a listing | `POST /listings` | Image approval check (`ImageUploads`) + `PutItem` (Listings) |
| 5 | Edit a listing (owner only) | `PUT /listings/{listingId}` | `GetItem` (ownership) + `UpdateItem` |
| 6 | Delete a listing (owner only) | `DELETE /listings/{listingId}` | `GetItem` (ownership) + `DeleteItem` |
| 7 | Get / update own profile | `GET`/`PUT /profile` | `GetItem`/`UpdateItem` (Users, base) |
| 8 | List all users (admin) | `GET /admin/users` | `Query` (Users, `AdminUserIndex`) |
| 9 | Suspend/reinstate a user (admin) | `PUT /admin/users/{userId}` | `UpdateItem` (Users, base) |
| 10 | Get my wishlist | `GET /wishlist` | `Query` (Wishlist, base) |
| 11 | Add/remove a wishlist item | `POST`/`DELETE /wishlist` | `PutItem` (conditional) / `DeleteItem` (Wishlist, base) |
| 12 | List my message threads | `GET /messages` | `Query` (Messages, `ParticipantInboxIndex`) |
| 13 | Start a thread | `POST /messages` | `TransactWriteItems` (Messages, base) |
| 14 | Read a thread's messages | `GET /messages/{threadId}` | `GetItem` (participant check) + `Query` (Messages, base, SK `begins_with "MSG#"`) |
| 15 | Send a message | `POST /messages/{threadId}` | `GetItem` (participant check) + `PutItem` + 2× `UpdateItem` |
| 16 | List my notifications | `GET /notifications` | `Query` (Notifications, base) |
| 17 | Mark a notification read | `PUT /notifications/{notificationId}/read` | `UpdateItem` (Notifications, base) |
| 18 | Submit a report | `POST /reports` | `PutItem` (Reports, base) |
| 19 | List reports (admin) | `GET /admin/reports` | `Query` (Reports, `StatusIndex`) |
| 20 | Resolve a report (admin) | `PUT /reports/{reportId}` | `UpdateItem` (Reports, base) |
| 21 | List all listings (admin) | `GET /admin/listings` | `Query` (Listings, `StatusExpiryIndex`) per status |
| 22 | Moderate a listing (admin) | `PUT /admin/listings/{listingId}` | `UpdateItem` (Listings, base) |
| 23 | Record an image upload | `POST /uploads/images` | `PutItem` (ImageUploads, base, `status = PENDING`) |
| 24 | Record Rekognition result | *(internal — S3-triggered workflow)* | `UpdateItem` (ImageUploads, base, `status = APPROVED/FLAGGED`) |
| 25 | Verify image approval at publish time | `POST /listings` / `PUT /listings/{listingId}` | `BatchGetItem` (ImageUploads, base) |
| 26 | Expire due listings | *(internal — EventBridge)* | `Query` (Listings, `StatusExpiryIndex`, PK `"ACTIVE"`, SK ≤ now) + `UpdateItem` per match |

Every pattern above is a `GetItem`, `Query`, `PutItem`, `UpdateItem`, `DeleteItem`, `BatchGetItem`, or `TransactWriteItems` call. No `Scan` appears anywhere in this design.

---

## 14. Listing Lifecycle

```
(images uploaded + APPROVED) --POST /listings--> ACTIVE
ACTIVE --expiresAt reached (EventBridge)--> EXPIRED
ACTIVE --admin PUT /admin/listings/{id}, action=REMOVE--> REMOVED
ACTIVE --admin PUT /admin/listings/{id}, action=FLAG--> FLAGGED
ACTIVE --admin PUT /admin/listings/{id}, action=KEEP--> ACTIVE (no-op)
ACTIVE --owner DELETE /listings/{id}--> (item removed from DynamoDB)
```

- A listing item is only ever created in the `ACTIVE` status — `POST /listings` does not persist anything until every referenced image is `APPROVED` (see [Section 16](#16-rekognition-moderation-metadata)), so there is no `PENDING` listing status stored in DynamoDB.
- `EXPIRED` is applied only by the EventBridge-driven expiry Lambda (`docs/architecture.md`, Section 16) — never directly by a user action.
- `REMOVED`/`FLAGGED` are admin-only status transitions (`PUT /admin/listings/{listingId}`) — per `docs/features.md` (Feature 19), this is a `status` update, not a delete, preserving the record for audit/report history.
- Owner-initiated deletion (`DELETE /listings/{listingId}`) is a hard `DeleteItem` — distinct from the admin "remove" action, which is a soft status change. This matches the `{ "listingId": ..., "deleted": true }` response documented in `docs/api.md`.
- Editing a listing (`PUT /listings/{listingId}`) does not itself change `status`; if new images are attached during the edit, those images must independently reach `APPROVED` before the update succeeds, using the same verification as creation.

---

## 15. Image/S3 Relationship

- **Amazon S3** stores the image binaries. It is the only place raw image bytes ever live — never DynamoDB (`docs/architecture.md`, Section 10; `docs/features.md`, Feature 7).
- **DynamoDB stores references, not bytes.** The `Listings.images` attribute is a list of `{ objectKey, status }` pairs — a pointer into S3 plus the last-known moderation state, copied onto the listing at publish time for fast reads (so `GET /listings`/`GET /listings/{listingId}` never has to join out to `ImageUploads`).
- **The `ImageUploads` table is the moderation source of truth** for an `objectKey` between the time it's uploaded and the time (if ever) it's attached to a listing — see [Section 16](#16-rekognition-moderation-metadata).
- Object keys are scoped/namespaced per uploader (e.g. including the authenticated `userId`) so a client can never reference or overwrite another user's object, consistent with `docs/api.md` (Image Upload — S3 Object Key).

---

## 16. Rekognition Moderation Metadata

**Table: `ImageUploads`**

| Field | Value |
|---|---|
| **PK** | `IMAGE#{objectKey}` |
| **SK** | *(none)* |
| **Attributes** | `objectKey`, `uploaderId`, `status` (`PENDING` \| `APPROVED` \| `FLAGGED`), `uploadedAt`, `analyzedAt`, `listingId` (null until attached to a listing) |
| **GSI** | None required |

**Flow** (`docs/api.md`, Image Upload): `Next.js → POST /uploads/images → Lambda → presigned S3 upload → S3 → Rekognition → APPROVED or FLAGGED → POST /listings → Lambda verifies image approval → DynamoDB`.

1. `POST /uploads/images` → Lambda `PutItem`s an `ImageUploads` record with `status = PENDING` and returns the presigned upload target. This call is asynchronous with respect to the actual S3 upload.
2. Once the object lands in S3, an S3-event-triggered image-processing Lambda invokes Rekognition and `UpdateItem`s the same `ImageUploads` record to `status = APPROVED` or `status = FLAGGED`, with `analyzedAt` set.
3. At `POST /listings` (or `PUT /listings/{listingId}` when images change), Lambda `BatchGetItem`s every referenced `objectKey` from `ImageUploads` and confirms **all** are `APPROVED`. An unprocessed (`PENDING`) or `FLAGGED` image blocks the write — the listing is not persisted and the request fails with `400 IMAGE_NOT_READY` / `400 IMAGE_FLAGGED` (`docs/api.md`, Listings API and Image Upload).
4. On success, Lambda also stamps `listingId` onto the `ImageUploads` record(s) — this both closes the loop for cleanup ([Section 22](#22-erroredge-cases)) and lets an admin/debug read trace an `objectKey` back to its listing.

---

## 17. Admin Access Patterns

All admin reads/writes require `role = ADMIN`, verified in Lambda on every call — see [Section 18](#18-security-and-authorization). DynamoDB-level patterns:

| Action | Table | Operation |
|---|---|---|
| List user accounts | Users | `Query` on `AdminUserIndex` |
| Suspend/reinstate an account | Users | `UpdateItem` on `PK = USER#{userId}` |
| List all listings (optionally by status) | Listings | `Query` on `StatusExpiryIndex` per status, fanned out if unfiltered |
| Moderate a listing (keep/remove/flag) | Listings | `UpdateItem` on `PK = LISTING#{listingId}` |
| List reports (optionally by status) | Reports | `Query` on `StatusIndex` |
| Resolve a report | Reports | `UpdateItem` on `PK = REPORT#{reportId}` |
| Resolve listing detail for a report under review | Listings | `GetItem` on `PK = LISTING#{listingId}` (using the report's stored `listingId`) |

Admin access is never broader at the database layer than what these specific patterns need — an admin's read of "all listings" is still a set of `Query` calls against `StatusExpiryIndex`, not a `Scan`.

---

## 18. Security and Authorization

- **Authentication** is Cognito's responsibility alone; DynamoDB never sees or stores credentials.
- **Authorization is enforced in Lambda, before any DynamoDB call**, per `docs/architecture.md` (Section 6, Section 20) and `docs/api.md` (Authorization and RBAC). DynamoDB itself has no notion of `STUDENT`/`ADMIN` — every role check happens in application code against the Cognito token's claims.
- **Ownership/participant checks are structural, not incidental:** partition keys for user-scoped tables (`Wishlist`, `Notifications`, and the `mine` view of `Listings`) are built from the token's `userId`, so a client cannot address another user's items by guessing an ID. Where the resource is keyed by its own ID instead (`Listings`, `Messages`/threads, `Reports`), Lambda performs an explicit `GetItem` ownership/participant check (`sellerId === userId`, `PARTICIPANT#{userId}` exists) before allowing a mutation, returning `403 Forbidden` on mismatch.
- **IAM least privilege:** each domain Lambda's execution role is scoped only to the DynamoDB table(s) (and specific actions — `Query`/`GetItem`/`PutItem`/`UpdateItem`/`DeleteItem`) its function actually needs, consistent with `docs/architecture.md` (Section 8).
- **The frontend never has direct DynamoDB access** — it is not a security boundary, and no table, index, or credential is ever exposed to the client.

---

## 19. EventBridge Interaction with Expired Listings

Per `docs/architecture.md` (Section 16):

1. A scheduled **EventBridge** rule triggers the expiry Lambda on a recurring basis.
2. The Lambda runs `Query` on `Listings.StatusExpiryIndex` with `PK = "ACTIVE"` and `SK (expiresAt) ≤ now` — a bounded, indexed range query, never a `Scan` of the whole table.
3. For each match, the Lambda `UpdateItem`s the listing's `status` to `EXPIRED`. Because `status` is the GSI's partition key, the item naturally leaves the `"ACTIVE"` partition of `StatusExpiryIndex` the moment it's updated — no separate cleanup step is needed.
4. The same workflow invokes **SES** to send the seller a listing-expiry email (`docs/architecture.md`, Section 17) and writes a `LISTING_EXPIRY` item to the `Notifications` table for that seller (`docs/features.md`, Feature 12).
5. **CloudWatch** captures Lambda execution results and surfaces any scheduled-workflow failures or delays.

`EventBridge` is used only for this scheduled, asynchronous expiry workflow — never for synchronous CRUD, consistent with `docs/architecture.md` (Section 16).

---

## 20. Important DynamoDB Query Patterns

Representative `Query` shapes (illustrative, not implementation code):

- **Browse active listings:** `Query` on `Listings.StatusExpiryIndex`, `KeyConditionExpression: status = "ACTIVE"`, optional `FilterExpression: category = :cat`, `ScanIndexForward: true` (soonest-expiring first) or sorted client-side by `createdAt` if a different order is desired.
- **My listings:** `Query` on `Listings.SellerIndex`, `KeyConditionExpression: sellerId = :me`.
- **Expiry scan:** `Query` on `Listings.StatusExpiryIndex`, `KeyConditionExpression: status = "ACTIVE" AND expiresAt <= :now`.
- **My wishlist:** `Query` on `Wishlist`, `KeyConditionExpression: PK = "USER#{userId}"`.
- **Thread messages:** `Query` on `Messages`, `KeyConditionExpression: PK = "THREAD#{threadId}" AND begins_with(SK, "MSG#")`.
- **My threads (inbox):** `Query` on `Messages.ParticipantInboxIndex`, `KeyConditionExpression: userId = :me`, `ScanIndexForward: false`.
- **My notifications:** `Query` on `Notifications`, `KeyConditionExpression: PK = "USER#{userId}"`, `ScanIndexForward: false`.
- **Reports by status:** `Query` on `Reports.StatusIndex`, `KeyConditionExpression: status = :status`.
- **All admin users:** `Query` on `Users.AdminUserIndex`, `KeyConditionExpression: PK = "USER"`.

Every pattern above uses a `KeyConditionExpression` on a real partition (and, where needed, sort) key — none rely on a `Scan` with a `FilterExpression` as the primary retrieval mechanism.

---

## 21. Data Validation

Validation is performed in Lambda before any write, independent of client-side checks (`docs/features.md`, multiple features), with DynamoDB condition expressions used to enforce integrity where race conditions matter:

- **Listings:** `title`, `description`, `price`, `category`, `condition` required; `price` must be a positive number; `category` checked against a known, small set of application-level category values; at least one `APPROVED` image required before `PutItem`.
- **Wishlist:** `PutItem` uses `ConditionExpression: attribute_not_exists(PK)` to prevent duplicate saves without a prior read.
- **Messages:** message `content` required and length-limited; sender may not be the listing's own `sellerId` when starting a thread.
- **Notifications:** always written server-side by the triggering workflow — never client-supplied.
- **Reports:** `reason` required; `listingId` must resolve via `GetItem` before the report is created.
- **Profile:** required fields validated; `userId` in the key is always the token's `userId`, so cross-user writes are structurally impossible rather than merely rejected after the fact.
- **Admin mutations:** `action` values (`SUSPEND`/`REINSTATE`, `KEEP`/`REMOVE`/`FLAG`) are validated against a fixed enum before the corresponding `UpdateItem`.

---

## 22. Error/Edge Cases

- **Orphaned image uploads:** an `ImageUploads` record whose `listingId` remains null well past a reasonable window (upload never completed into a listing) is a candidate for scheduled cleanup — handled the same way listing expiry is (an EventBridge-driven sweep), not by any new service.
- **Listing deleted/expired while referenced elsewhere:** `Wishlist`, `Notifications`, and `Reports` items may reference a `listingId` that no longer resolves via `GetItem` on `Listings`. Per `docs/features.md`, these are handled gracefully in the UI (shown as unavailable) rather than treated as a data error — DynamoDB does not enforce referential integrity across tables, so this is expected and tolerated by design.
- **Concurrent wishlist toggles:** a rapid add/remove race is resolved by the conditional `PutItem` (duplicate add fails cleanly) and idempotent `DeleteItem` (removing an already-removed item is a no-op `404`, not a crash).
- **Concurrent admin moderation:** two admins acting on the same listing/report resolve via last-write-wins `UpdateItem` semantics; CloudWatch logging (`docs/architecture.md`, Section 18) makes the sequence of actions auditable after the fact.
- **Listing edited right at the expiry boundary:** the expiry Lambda's `Query` window is a point-in-time snapshot; a listing renewed (new `expiresAt`) after the query ran but before the corresponding `UpdateItem` is negligible in practice given the short Lambda execution window, and is acceptable per `docs/architecture.md` (Section 16) edge-case framing.
- **Reporting an already-deleted listing:** `POST /reports` performs a `GetItem` against `Listings` first; a missing listing yields `404` before any `Reports` write occurs.
- **Duplicate reports on the same listing:** allowed at the data-model level (each `POST /reports` creates a new `reportId`); any rate-limiting/duplicate-prevention is an application-level check in Lambda, not a DynamoDB constraint.

---

## 23. Database Interview Questions

**Q: Why does this design use one table per domain instead of a single-table design?**
A: Because no CampusMart AI access pattern needs to fetch heterogeneous entities (a listing, a wishlist entry, a thread) in one request. One table per domain keeps each Lambda's IAM permissions narrow and each key schema easy to reason about, at the cost of a few extra round trips the application never actually needs to avoid.

**Q: How do you avoid `Scan` for "list all users" or "list all listings" admin views?**
A: Sparse/constant-partition GSIs. `Users.AdminUserIndex` uses a constant partition key (`"USER"`) so all users share one logical partition that can be `Query`'d directly; `Listings.StatusExpiryIndex` partitions by `status`, so "all listings" becomes a small, bounded fan-out of `Query` calls (one per known status) instead of a table `Scan`.

**Q: How is ownership enforced at the database layer?**
A: Two ways. For resources naturally scoped to a user (`Wishlist`, `Notifications`), the partition key itself is built from the authenticated `userId`, so a client structurally cannot address another user's items. For resources keyed by their own ID (`Listings`, `Messages`, `Reports`), Lambda performs an explicit ownership/participant check via `GetItem` before allowing any mutation.

**Q: Why is `Messages` a single table with three item types under one partition instead of separate `Threads` and `Messages` tables?**
A: Because `GET /messages/{threadId}` always needs the thread's metadata and its full message history together, and `POST /messages/{threadId}` always touches the metadata and message items in the same operation. Colocating them under `PK = THREAD#{threadId}` and distinguishing by `SK` prefix turns what would be a two-table join into one `Query`.

**Q: How does "my threads" work without a many-to-many join table?**
A: Each thread has a dedicated `PARTICIPANT#{userId}` item per participant (two per thread), and a sparse GSI (`ParticipantInboxIndex`) indexes only those participant items by `userId`. Querying that GSI for a given user returns exactly the threads they participate in, each carrying a denormalized preview — no scatter-gather join required.

**Q: Why is a listing never created in a `PENDING` state?**
A: Because `POST /listings` verifies every referenced image is `APPROVED` in `ImageUploads` *before* the `PutItem` runs. If any image is unprocessed or flagged, the write never happens — so there's no half-published listing sitting in the table waiting on moderation.

**Q: What happens to a listing's images after Rekognition approves them?**
A: The moderation source of truth lives in `ImageUploads`, keyed by `objectKey`, from upload until the listing is created. At creation time, the `{objectKey, status}` pairs are copied onto the `Listings` item itself, so future reads of the listing don't need to re-check `ImageUploads` — that table stays authoritative only for images not yet (or never) attached to a listing.

**Q: How does the listing-expiry workflow avoid scanning the whole `Listings` table every run?**
A: `StatusExpiryIndex` partitions by `status` and sorts by `expiresAt`, so the expiry Lambda's `Query` (`status = "ACTIVE" AND expiresAt <= now`) touches only the active, currently-due listings — an indexed range query, not a full-table `Scan`.

**Q: Why is `PUT /notifications/{notificationId}/read` a direct `UpdateItem` instead of a query-then-update?**
A: Because `notificationId` is a time-sortable unique ID used directly as the sort key (`NOTIF#{notificationId}`). The client only ever needs to supply `notificationId`; Lambda combines it with the token's `userId` to form the full key, so the update is a single, direct `UpdateItem` call.

**Q: Where does authorization actually happen — DynamoDB or Lambda?**
A: Always Lambda. DynamoDB has no concept of `STUDENT`/`ADMIN` roles or per-item ownership rules; it only enforces whatever key conditions and condition expressions a request supplies. Every role check and ownership check happens in application code, before the DynamoDB call is made — consistent with `docs/architecture.md`'s statement that the frontend (and, by extension, the database) is never the security boundary.
