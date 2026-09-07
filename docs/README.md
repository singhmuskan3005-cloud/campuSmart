# CampusMart AI

A secure, full-stack, serverless marketplace built specifically for college students.

CampusMart AI enables students to buy and sell items within their campus community through a modern, scalable, and cloud-native platform built on AWS managed services.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Architecture Style](#architecture-style)
- [High-Level Architecture](#high-level-architecture)
- [Authentication & Authorization](#authentication--authorization)
- [API Overview](#api-overview)
- [Data Storage](#data-storage)
- [Image Handling](#image-handling)
- [Automation & Notifications](#automation--notifications)
- [Monitoring](#monitoring)
- [Security](#security)
- [Why Serverless?](#why-serverless)
- [Development Roadmap](#development-roadmap)
- [Documentation](#documentation)

---

## Overview

CampusMart AI is a serverless marketplace application that allows students to create accounts, list products for sale, browse and search listings, manage a wishlist, contact sellers, and report suspicious activity. Administrators have access to a dedicated dashboard for managing users, listings, and reports, and for taking moderation actions.

The platform is built entirely on managed AWS services, avoiding the need to provision or maintain traditional servers.

### Student Capabilities

- Create an account and log in securely
- Browse marketplace listings
- Search and filter products
- View product details
- Create, edit, and delete their own listings
- Upload product images
- Add products to a wishlist
- Contact sellers
- Receive notifications
- Manage their profile
- Report suspicious listings

### Administrator Capabilities

- Access an admin dashboard
- Manage users
- Manage listings
- Review reports
- Moderate marketplace content
- Take administrative actions

---

## Features

- Secure authentication and role-based access control
- Product listing creation with image upload
- Automated image moderation
- Search and filtering of marketplace listings
- Wishlist management
- Listing reporting and admin moderation workflow
- Automated listing expiry
- Transactional email notifications
- Centralized monitoring and observability

---

## Technology Stack

### Frontend

- Next.js 15
- React
- TypeScript
- Tailwind CSS
- shadcn/ui

### Authentication

- Amazon Cognito

### Backend

- Amazon API Gateway
- AWS Lambda

### Database

- Amazon DynamoDB

### Object Storage

- Amazon S3

### Image Analysis

- Amazon Rekognition

### Automation

- Amazon EventBridge

### Email

- Amazon SES

### Monitoring

- Amazon CloudWatch

### Repository

- GitHub

---

## Architecture Style

CampusMart AI follows a set of consistent architectural principles:

- Serverless architecture
- Event-driven architecture
- REST API architecture
- Component-based frontend architecture
- Managed AWS services
- Role-based access control
- Separation of concerns
- API-first backend communication

The backend does **not** depend on a permanently running EC2 server.

---

## High-Level Architecture

```
                    ┌─────────────────────┐
                    │       STUDENT       │
                    │       / ADMIN       │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │     Next.js App     │
                    │ React + TypeScript  │
                    │    Tailwind CSS     │
                    └──────────┬──────────┘
                               │
                         HTTPS / REST
                               │
                               ▼
                    ┌─────────────────────┐
                    │   Amazon Cognito    │
                    │ Authentication +    │
                    │ Identity / Roles    │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │   API Gateway       │
                    │    REST APIs        │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │    AWS Lambda       │
                    │   Business Logic    │
                    └───────┬─────┬───────┘
                            │     │
              ┌─────────────┘     └─────────────┐
              ▼                                 ▼
     ┌─────────────────┐              ┌─────────────────┐
     │   DynamoDB      │              │       S3        │
     │ Application     │              │ Product Images  │
     │ Data            │              │                 │
     └─────────────────┘              └────────┬────────┘
                                               │
                                               ▼
                                    ┌────────────────────┐
                                    │ Amazon Rekognition │
                                    │ Image Analysis /   │
                                    │ Moderation         │
                                    └────────────────────┘

                  EVENT-DRIVEN WORKFLOWS

                    ┌─────────────────┐
                    │ EventBridge     │
                    │ Events/Schedules│
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │ AWS Lambda      │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │ Amazon SES      │
                    │ Email           │
                    └─────────────────┘

                    MONITORING

        Lambda / API Gateway / EventBridge
                     │
                     ▼
              ┌──────────────┐
              │ CloudWatch   │
              │ Logs/Metrics │
              └──────────────┘
```

The frontend communicates with AWS through authenticated REST APIs and does not contain core business logic, which belongs to the backend.

---

## Authentication & Authorization

Amazon Cognito handles user authentication.

**Authentication flow:**

```
User → Signup → Cognito → Email Verification → Login →
Cognito Authentication → Authentication Tokens →
Next.js Application → Authenticated API Requests →
API Gateway → Lambda
```

Authentication and authorization are treated as separate concerns:

- **Authentication** answers: *"Who is this user?"*
- **Authorization** answers: *"What is this user allowed to do?"*

### Role-Based Access Control (RBAC)

The system defines two primary roles: **STUDENT** and **ADMIN**.

RBAC is enforced on the backend. The frontend may hide unauthorized UI elements, but frontend hiding alone is not considered security. Lambda/API authorization must verify the authenticated user and their role before executing protected operations.

---

## API Overview

Amazon API Gateway provides the REST API layer. Authentication is handled by Cognito.

**Listings**
```
GET    /listings
GET    /listings/{id}
POST   /listings
PUT    /listings/{id}
DELETE /listings/{id}
```

**Wishlist**
```
GET    /wishlist
POST   /wishlist
DELETE /wishlist/{listingId}
```

**Profile**
```
GET    /profile
PUT    /profile
```

**Reports**
```
POST   /reports
GET    /reports/{id}
PUT    /reports/{id}
```

**Messages**
```
GET    /messages
POST   /messages
GET    /messages/{threadId}
POST   /messages/{threadId}
```

**Notifications**
```
GET    /notifications
PATCH  /notifications/{id}
```

**Admin**
```
GET    /admin/users
PUT    /admin/users/{id}
GET    /admin/listings
PUT    /admin/listings/{id}
GET    /admin/reports
```

`PUT /reports/{id}` records the resolution/action taken on a report. `PUT /admin/listings/{id}` is the admin moderation endpoint (distinct from the owner-scoped `PUT /listings/{id}`, which remains restricted to the listing's `sellerId`). `PUT /admin/users/{id}` applies an administrative action to a user account. `GET/POST /messages` and `GET/POST /messages/{threadId}` support the existing Contact Sellers / Messages pages. `GET /notifications` and `PATCH /notifications/{id}` support the existing Notifications page and its read/unread state.

The complete API contract will be documented separately in `api.md` when backend development begins.

AWS Lambda contains the backend business logic and may be organized by domain (listings, users/profile, wishlist, reports, admin, image processing, notifications, expiry) rather than as a single monolithic function. Lambda functions are stateless, small, focused, and independently testable, and access AWS resources using IAM permissions.

---

## Data Storage

Amazon DynamoDB stores application data. Core entities include:

- Users
- Listings
- Wishlist records
- Reports
- Messages / Message threads
- Notifications
- Marketplace metadata

Listing data may include: `listingId`, `sellerId`, `title`, `description`, `price`, `category`, `condition`, image references, `status`, `createdAt`, and `expiresAt`.

User data may include: `userId`, `email`, `name`, `role`, profile information, and `createdAt`.

The exact DynamoDB key design and access patterns will be documented in `database.md`. This project does not use relational database tables or SQL architecture.

---

## Image Handling

Amazon S3 stores uploaded product images. Product images are **not** stored directly inside DynamoDB.

**Upload flow:**
```
Student → Sell Item Page → Request secure upload →
Backend / Lambda → S3 upload mechanism → S3 →
Image reference stored with listing metadata
```

The architecture favors secure direct browser uploads using controlled upload mechanisms where appropriate. S3 bucket access is not publicly writable.

### Image Analysis

Amazon Rekognition analyzes uploaded product images to support automated image moderation, detect potentially inappropriate or unsuitable content, and provide image-related metadata where useful.

```
Student uploads image → S3 → Image processing workflow →
Amazon Rekognition → Analysis result → Accept / Flag → Listing workflow
```

---

## Automation & Notifications

### EventBridge

Amazon EventBridge powers automated and event-driven workflows. The primary use case is **listing expiry**:

```
Listing Created → expiresAt stored → EventBridge scheduled workflow →
Lambda → Find / process expired listings → DynamoDB →
Listing status = EXPIRED
```

EventBridge may also be used for other application events where asynchronous processing is appropriate, but is not used for normal synchronous CRUD requests.

### SES

Amazon SES delivers transactional email notifications, such as:

- Listing expiry notifications
- Listing status notifications
- Seller notifications
- Important marketplace notifications

```
Listing Expiry → EventBridge → Lambda → SES → Seller Email
```

SES is an email delivery service and is not responsible for application business logic.

---

## Monitoring

Amazon CloudWatch provides monitoring and observability across:

- Lambda execution, errors, and duration
- API errors
- Application logs
- Event-driven workflow failures
- Important application metrics

The application uses meaningful structured logging to make production debugging possible.

---

## Security

Security principles applied throughout CampusMart AI:

- Cognito for authentication
- Backend-enforced authorization
- Role-based access control
- HTTPS
- IAM least privilege
- Private S3 storage
- Controlled image upload
- Input validation
- Server-side validation
- Secure API access
- No secrets in frontend source code
- Environment variables for configuration
- CloudWatch monitoring

The frontend is not considered a security boundary. All important authorization decisions happen server-side.

---

## Why Serverless?

CampusMart is a student marketplace with potentially variable traffic. Serverless provides:

- Automatic scaling
- No server management
- Pay-per-use execution model
- Reduced infrastructure maintenance
- Managed AWS infrastructure
- Easy integration with event-driven workflows

Instead of a client talking to a permanently running EC2 server, CampusMart uses:

```
Client → API Gateway → Lambda → AWS managed services
```

---

## Development Roadmap

The project is built incrementally across the following phases:

| Phase | Focus |
|-------|-------|
| 1 | Frontend foundation (Next.js, React, TypeScript, Tailwind, shadcn/ui, routing, layouts, reusable components, mock data) |
| 2 | Authentication (Cognito, signup, login, verification, protected routes, roles) |
| 3 | Backend (API Gateway, Lambda, REST APIs) |
| 4 | Database (DynamoDB, listing CRUD, user data, wishlist, reports) |
| 5 | Storage (S3, secure image uploads) |
| 6 | Image Intelligence (Rekognition, image analysis/moderation) |
| 7 | Automation (EventBridge, listing expiry, automated workflows) |
| 8 | Email (SES, transactional notifications) |
| 9 | Monitoring (CloudWatch, logs, metrics, error monitoring) |
| 10 | Testing and deployment |

---

## Documentation

Additional documentation will be provided as the project develops:

- `api.md` — Full API contract
- `database.md` — DynamoDB key design and access patterns
- `pages.md` — Frontend page specifications
- `components.md` — Frontend component specifications

---

## Scope Note

This project intentionally remains focused on the following AWS services: Cognito, API Gateway, Lambda, DynamoDB, S3, Rekognition, EventBridge, SES, and CloudWatch. Services such as Amazon Bedrock, OpenSearch, SNS, CloudFront, WAF, ElastiCache, RDS, EC2, WebSocket API, ECS, and EKS are not part of the current architecture and are considered future enhancements only if explicitly requested.
