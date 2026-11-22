# Project Architecture Specification: Golf Charity Subscription Platform

**Document Version:** 1.0.0  
**Status:** Approved for Phase 1 Architecture Review  
**Date:** November 2026  
**Author:** Full-Stack Developer & Software Architect  

---

## 1. Executive Summary & System Overview

The **Golf Charity Subscription Platform** is a high-integrity, fintech-grade digital ecosystem bridging amateur golf engagement, charitable philanthropy, and recurring prize draws. Subscribers pay a monthly or annual membership fee, maintain active golf scores (such as Stableford scores), nominate a beneficiary charity, and gain monthly entry into automated, auditable prize draws with 3-, 4-, and 5-number match tiers.

The platform deviates strictly from conventional recreational golf websites by adopting the security, financial precision, and design aesthetics of modern fintech applications.

```
                           +-------------------------------------------------+
                           |             Public Internet / Users             |
                           +-------------------------------------------------+
                                      |                           |
                            HTTPS/WSS |                 Stripe    | Webhooks
                                      v                           v
                           +----------------------+   +----------------------+
                           |   Client (SPA)       |   |  Stripe API Gateway  |
                           |   React + Vite +     |   +----------------------+
                           |   Apollo Client      |               |
                           +----------------------+               |
                                      |                           |
                            GraphQL   | HTTPS                     | HTTPS (Signed)
                                      v                           v
                           +-------------------------------------------------+
                           |           Server Application (Express)          |
                           |  +-------------------------------------------+  |
                           |  | Middlewares: CORS, Helmet, RateLimit,     |  |
                           |  | Auth (JWT/RBAC), Request Logging          |  |
                           |  +-------------------------------------------+  |
                           |  | Apollo Server (GraphQL API Layer)         |  |
                           |  +-------------------------------------------+  |
                           |  | Core Services & Domain Engines:           |  |
                           |  | - Auth & User Service                     |  |
                           |  | - Subscription & Stripe Webhook Service   |  |
                           |  | - Golf Score Engine (1-45 Validation)     |  |
                           |  | - Charity & Allocation Engine             |  |
                           |  | - Cryptographic Draw Engine & Simulator   |  |
                           |  | - Prize Pool & Payout Engine              |  |
                           |  | - Audit Log & Verification Workflow       |  |
                           |  +-------------------------------------------+  |
                           |  | TypeORM Data Access Layer (Migrations)    |  |
                           +-------------------------------------------------+
                                      |
                           PostgreSQL | Connection Pooling & Strict Transactions
                                      v
                           +-------------------------------------------------+
                           |            PostgreSQL Database (v16+)           |
                           |  - 22 Normalized Relational Entities            |
                           |  - Integer Minor Currency Units (Cents/Pence)   |
                           |  - Row-Level Locking & Audit Trails             |
                           +-------------------------------------------------+
```

---

## 2. Technology Stack & Rationale

| Layer | Selected Technologies | Technical Rationale |
| :--- | :--- | :--- |
| **Frontend Framework** | React 18+ with TypeScript (Strict) | Component modularity, rich ecosystem, strict compile-time type safety. |
| **Build Tool** | Vite | Lightning-fast HMR, optimized Rollup bundling, first-class TS support. |
| **Styling & Design** | Tailwind CSS with Custom Theme | Rapid utility-first styling adhering to the design system (Navy `#101827`, Lime `#C5F36A`, Charcoal `#252A32`, Off-White `#F7F7F2`). |
| **Data Fetching / State** | Apollo Client 3 | Normalized caching, optimistic UI updates, declarative GraphQL queries/mutations. |
| **Form Handling & Validation**| React Hook Form + Zod | High-performance uncontrolled forms, zero unnecessary re-renders, runtime schema validation shared with backend types. |
| **Motion & Icons** | Framer Motion & Lucide React | Micro-interactions, financial dashboard animations, clean SVG iconography. |
| **Routing** | React Router DOM v6 | Nested layouts, data loaders, protected route guards (`RequireAuth`, `RequireRole`). |
| **Backend Runtime** | Node.js 22 LTS | High-throughput asynchronous event loop, native Web Crypto, long-term stability. |
| **API Server** | Express with Apollo Server 4 | Industry-standard GraphQL server framework, modular resolvers, customizable context. |
| **Data Access / ORM** | TypeORM with Migrations | Strong TypeScript decorator support, active record/data mapper patterns, explicit migration control with `synchronize: false` in production. |
| **Database** | PostgreSQL 16+ / 18 | ACID compliance, robust constraints, integer math, advisory locks for financial safety. |
| **Payments** | Stripe API & Stripe Webhooks | Robust subscription management, PCI compliance via Checkout, signed webhook events with idempotent handlers. |
| **Authentication** | JWT + Refresh Token Rotation + bcrypt | Stateless fast access tokens, revocable refresh tokens in DB, secure password hashing (cost factor 12). |

---

## 3. Directory Structure Specification

The project maintains a monorepo-style structure separating `client`, `server`, and shared `docs`.

```
golf_charity/
├── .gitignore
├── README.md
├── docker-compose.yml              # Local PostgreSQL & Redis infrastructure
├── docs/                           # Architecture, database, API, and rule documentation
│   ├── PROJECT_ARCHITECTURE.md
│   ├── DATABASE_DESIGN.md
│   ├── GRAPHQL_ARCHITECTURE.md
│   ├── BUSINESS_RULES.md
│   └── DEVELOPMENT_ROADMAP.md
│
├── client/                         # Frontend Application (React + Vite + TypeScript)
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   ├── tsconfig.node.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── .env.example
│   ├── public/
│   │   ├── favicon.svg
│   │   └── robots.txt
│   └── src/
│       ├── main.tsx
│       ├── App.tsx
│       ├── vite-env.d.ts
│       ├── assets/
│       │   └── branding/
│       ├── components/             # Reusable UI component library
│       │   ├── ui/                 # Buttons, Cards, Inputs, Modals, Badges, Tabs, Skeletons
│       │   ├── layout/             # Navbar, Footer, Sidebar, TopHeader, DashboardLayout
│       │   ├── feedback/           # Toast, ErrorBoundary, AlertBanner, EmptyState
│       │   └── charts/             # Revenue, Donation, and Draw Statistics Charts
│       ├── config/                 # Apollo client configuration, constants, navigation routes
│       ├── context/                # AuthContext, NotificationContext, Theme/DrawerContext
│       ├── graphql/                # GraphQL operations & generated types
│       │   ├── queries/            # auth.graphql, scores.graphql, draws.graphql, charities.graphql
│       │   ├── mutations/          # authMutations.graphql, scoreMutations.graphql, stripeMutations.graphql
│       │   └── generated/          # Auto-generated GraphQL hooks & types via Codegen
│       ├── hooks/                  # Custom hooks: useAuth, useScores, useDrawTimer, useStripeCheckout
│       ├── routes/                 # ProtectedRoute, AdminRoute, AppRouter
│       ├── types/                  # Shared frontend interfaces and enums
│       ├── utils/                  # Currency formatters, date formatters, score validators
│       └── views/                  # Feature-based pages and views
│           ├── public/             # HomePage, HowItWorksPage, PlansPage, CharityDirectoryPage, CharityDetailPage, FAQPage, ContactPage
│           ├── auth/               # LoginPage, RegisterPage, ForgotPasswordPage, ResetPasswordPage
│           ├── subscriber/         # OverviewView, GolfScoresView, DrawHistoryView, WinningsView, MyCharityView, SubscriptionsView, ProfileView
│           └── admin/              # AnalyticsView, UsersView, SubscriptionsAdminView, ScoresAdminView, DrawManagementView, DrawSimulationView, PrizePoolsView, CharitiesAdminView, WinnerVerificationView, PayoutsView, ReportsView, SettingsView
│
└── server/                         # Backend Application (Node.js + Express + Apollo Server + TypeORM)
    ├── package.json
    ├── tsconfig.json
    ├── .env.example
    ├── ormconfig.ts                # TypeORM DataSource configuration
    ├── src/
    │   ├── index.ts                # HTTP server bootstrap & graceful shutdown
    │   ├── app.ts                  # Express application setup, middlewares, routes
    │   ├── config/                 # Environment variables schema (envalid/zod), constants
    │   ├── constants/              # Roles, Statuses, Currency codes, Error codes
    │   ├── database/               # Database connection & migration runner
    │   │   ├── dataSource.ts       # TypeORM DataSource instance
    │   │   ├── migrations/         # Timestamped SQL/TypeORM migrations
    │   │   └── seeds/              # Seed data for plans, admin user, charities
    │   ├── entities/               # 22 TypeORM Entities
    │   │   ├── User.ts
    │   │   ├── UserProfile.ts
    │   │   ├── SubscriptionPlan.ts
    │   │   ├── Subscription.ts
    │   │   ├── Payment.ts
    │   │   ├── GolfScore.ts
    │   │   ├── Charity.ts
    │   │   ├── UserCharityPreference.ts
    │   │   ├── CharityDonation.ts
    │   │   ├── Draw.ts
    │   │   ├── DrawConfiguration.ts
    │   │   ├── DrawSimulation.ts
    │   │   ├── DrawEntry.ts
    │   │   ├── DrawResult.ts
    │   │   ├── PrizePool.ts
    │   │   ├── PrizeTier.ts
    │   │   ├── Winner.ts
    │   │   ├── WinnerProof.ts
    │   │   ├── Payout.ts
    │   │   ├── Notification.ts
    │   │   ├── RefreshToken.ts
    │   │   └── AuditLog.ts
    │   ├── graphql/                # Apollo Server 4 GraphQL Modules
    │   │   ├── schema.ts           # Root executable schema combiner
    │   │   ├── context.ts          # Auth context, dataloaders, req/res
    │   │   ├── directives/         # AuthDirective, HasRoleDirective
    │   │   └── modules/            # 13 Modular schemas and resolvers
    │   │       ├── auth/
    │   │       ├── users/
    │   │       ├── subscriptions/
    │   │       ├── payments/
    │   │       ├── scores/
    │   │       ├── charities/
    │   │       ├── donations/
    │   │       ├── draws/
    │   │       ├── prizePools/
    │   │       ├── winners/
    │   │       ├── payouts/
    │   │       ├── notifications/
    │   │       └── analytics/
    │   ├── services/               # Isolated Domain Business Logic
    │   │   ├── AuthService.ts
    │   │   ├── UserService.ts
    │   │   ├── SubscriptionService.ts
    │   │   ├── StripeService.ts
    │   │   ├── StripeWebhookService.ts
    │   │   ├── GolfScoreService.ts
    │   │   ├── CharityService.ts
    │   │   ├── DrawEngineService.ts
    │   │   ├── DrawSimulationService.ts
    │   │   ├── PrizePoolService.ts
    │   │   ├── WinnerVerificationService.ts
    │   │   ├── PayoutService.ts
    │   │   ├── NotificationService.ts
    │   │   └── AuditLogService.ts
    │   ├── middlewares/            # Express & GraphQL middlewares
    │   │   ├── authMiddleware.ts
    │   │   ├── rbacMiddleware.ts
    │   │   ├── errorHandler.ts
    │   │   ├── rateLimiter.ts
    │   │   └── requestLogger.ts
    │   ├── jobs/                   # Scheduled tasks (Cron/Node-cron)
    │   │   ├── drawSchedulerJob.ts
    │   │   ├── subscriptionSyncJob.ts
    │   │   └── auditLogPruneJob.ts
    │   ├── utils/                  # Shared utilities
    │   │   ├── cryptoRng.ts        # Cryptographically secure random number generators
    │   │   ├── currency.ts         # Integer minor unit calculations & formatting
    │   │   ├── jwt.ts              # Token signing & verification
    │   │   └── logger.ts           # Winston/Pino structured logging
    │   └── validators/             # Zod validation schemas
    └── tests/                      # Automated unit, integration, and e2e tests
        ├── unit/
        ├── integration/
        └── mocks/
```

---

## 4. Frontend Architecture (React + Vite + TypeScript)

### 4.1 State Management & Data Flow
- **Remote State:** Apollo Client 3 handles normalized query caching, cache eviction, and optimistic updates.
- **Local / Session State:** React Context API for lightweight global states (`AuthContext` for user session, `NotificationContext` for real-time alerts).
- **Form State:** `react-hook-form` coupled with `@hookform/resolvers/zod` ensures performant, uncontrolled input handling with immediate validation feedback.

### 4.2 Routing & Route Guards
The client uses `react-router-dom` v6 with layout wrappers:
- **Public Routes:** Home, How It Works, Plans, Charity Directory, FAQ, Contact, Login, Register.
- **Subscriber Protected Routes (`RequireAuth`):** Enforces an active JWT session with role `SUBSCRIBER` or `ADMIN`. Unauthenticated users redirect to `/login` with a `from` query param.
- **Admin Protected Routes (`RequireRole(['ADMIN'])`):** Restricts access strictly to administrative personnel. Unauthorized access returns a 403 Forbidden state.

### 4.3 Design System & Aesthetics
- **Theme:** High-end dark fintech style.
  - Primary Background: Navy (`#101827`)
  - Accent / CTA: Electric Lime (`#C5F36A`)
  - Surface / Card Background: Charcoal (`#252A32`)
  - Primary Text: Off-White (`#F7F7F2`)
  - Muted Text: Slate Gray (`#94A3B8`)
  - Border Accents: Subtly translucent lime borders (`rgba(197, 243, 106, 0.15)`).
- **Components:** Modular, accessible components styled with Tailwind CSS, leveraging Lucide icons for clean visual metaphors, and Framer Motion for smooth tab transitions and modal animations.

---

## 5. Backend Architecture (Express + Apollo Server + TypeORM)

### 5.1 Request Pipeline & Middleware Chain
Incoming HTTP requests pass through the following sequence:
1. **Security Headers:** `helmet` for CSP, XSS protection, and frameguard.
2. **CORS:** Configured strictly to allow credentials and trusted client origins.
3. **Stripe Raw Body Buffer:** The `/webhooks/stripe` route intercepts raw payload bytes before `express.json()` for cryptographic signature verification.
4. **Body Parsing & Rate Limiting:** `express.json()` and `express-rate-limit` to prevent brute force.
5. **Authentication Context:** Extracts `Bearer <token>` from the `Authorization` header, verifies JWT, and attaches the `User` entity to the request context.
6. **Apollo Server Middleware:** Routes `/graphql` through Apollo Server 4, instantiating per-request DataLoaders and passing contextual user/auth state to resolvers.

### 5.2 Service-Oriented Domain Layer
Resolvers are thin orchestration layers. All business logic, transaction handling, and validations live within isolated **Domain Services**:
- `AuthService`: Password hashing, token minting, refresh rotation.
- `GolfScoreService`: Concurrency-safe score submission, 1-45 range checks, 5-score limit enforcement with FIFO archival.
- `DrawEngineService`: Cryptographically secure draw execution, winner matching, and isolated simulation sandbox.
- `PrizePoolService`: Exact integer financial splits, jackpot rollover logic.
- `StripeWebhookService`: Idempotent event processing and subscription synchronization.

---

## 6. Authentication & RBAC Architecture

### 6.1 Token Lifecycle & Security
1. **Access Token:** Short-lived JWT (15-minute TTL) signed with `RS256` or `HS256` containing `sub` (userId), `email`, and `role`.
2. **Refresh Token Rotation:** Long-lived cryptographically random token (30-day TTL) stored as an SHA-256 hash in the `RefreshToken` database table.
3. **Rotation Mechanics:** Whenever a refresh token is exchanged, the existing token is marked `revoked = true` and a new token pair is issued.
4. **Reuse Detection:** If an already-revoked refresh token is presented, the system flags a potential token theft, immediately revokes **all** active refresh tokens for that user family, and creates a high-priority `AuditLog` entry.

### 6.2 Role-Based Access Control (RBAC)
Three distinct system roles are enforced at both the GraphQL resolver directive level and the service layer:
- `PUBLIC`: Unauthenticated visitors; restricted to viewing plans, charity directory, and published past draw results.
- `SUBSCRIBER`: Authenticated paying users; access to submit/edit golf scores, view personal entries and winnings, select charity preferences, and manage subscription billing.
- `ADMIN`: Platform operators; full permissions to manage draws, trigger isolated simulations, inspect audit logs, approve/reject winner proofs, and execute payouts.

---

## 7. Stripe Payment Architecture

### 7.1 Subscription Flow & Webhook Handling
```
User selects Plan -> Client creates Stripe Checkout Session (API)
                  -> Client redirects to Stripe Hosted Checkout
                  -> User completes payment on Stripe
                  -> Stripe fires signed Webhook events:
                     - checkout.session.completed
                     - customer.subscription.created / updated
                     - invoice.paid / invoice.payment_failed
```

### 7.2 Idempotency & Replay Protection
- Every inbound webhook event is verified using `stripe.webhooks.constructEvent(payload, signature, secret)`.
- The `stripeEventId` is checked against the `Payment` or `AuditLog` database table.
- If the event was already processed, the webhook immediately returns `200 OK` to prevent duplicate ledger entries or double-crediting draw entries.

---

## 8. Draw Engine & Simulation Sandbox

### 8.1 Cryptographic Randomness
- Standard `Math.random()` is **strictly prohibited**.
- The draw engine uses Node.js `crypto.randomInt(min, max)` (backed by the operating system CSPRNG) to generate winning numbers from the pool of 1 to 45 without replacement.

### 8.2 Two Execution Modes
1. **Random Draw Mode:** Standard unbiased uniform sampling across the range [1, 45].
2. **Frequency-Weighted Mode:** A configurable mathematical weighting mechanism based on subscriber-submitted score frequencies (see `docs/BUSINESS_RULES.md` for exact algorithms).

### 8.3 Simulation Isolation Guarantee
- Administrative simulations use the exact same mathematical draw algorithms but execute inside an isolated execution context.
- Simulations record results strictly in the `DrawSimulation` table.
- **Simulation Isolation Rule:** Simulations NEVER write to `Draw`, `DrawResult`, `DrawEntry`, `Winner`, `PrizePool`, or `Payout`, and never trigger notifications or financial movements.

---

## 9. Financial & Revenue Allocation Architecture

### 9.1 Integer Minor Currency Units
- Floating-point numbers (`FLOAT`, `DOUBLE`, `REAL`) are **strictly prohibited** for financial calculations.
- All monetary amounts (subscription prices, charity donations, prize pools, payouts, rollover amounts) are stored as 64-bit integers (`BIGINT`) representing minor currency units (e.g., USD cents `$19.99` = `1999`, GBP pence `£10.00` = `1000`).
- Every monetary record requires an explicit ISO 4217 currency code (e.g., `'USD'`, `'GBP'`, `'EUR'`).

### 9.2 Strict Revenue Segregation
Subscription revenue is **never** pooled into a single ambiguous bucket. Every completed subscription payment is decomposed into distinct, auditable ledger allocations:
1. **Stripe Processing Fees:** Deducted first.
2. **Charity Contribution:** Minimum 10% (or user/platform configured percentage) routed to the selected `Charity`.
3. **Prize Pool Allocation:** Configured percentage (e.g., 50%) allocated to the monthly `PrizePool`.
4. **Platform Operating Margin & Taxes:** Remaining balance retained for operations, hosting, and tax liabilities.

---

## 10. Security, Scalability & Production Readiness

### 10.1 Security Standards
- **Zero Secrets in Code:** Strict environment variable validation at startup via Zod.
- **SQL Injection Prevention:** 100% parameterized queries via TypeORM.
- **CSRF & XSS Mitigation:** Secure HTTP-only cookies for refresh tokens (or authorization headers), strict CSP headers, input sanitization.
- **Audit Logging:** Every administrative action, draw execution, score archival, and financial transaction creates an immutable row in `AuditLog`.

### 10.2 Concurrency & Transaction Boundaries
- Draw resolution, score updates, and payout distributions execute inside PostgreSQL **Serializable** or **Repeatable Read** database transactions with row-level locks (`SELECT ... FOR UPDATE`) to prevent race conditions.

### 10.3 Scalability Architecture
- **Stateless Backend:** Express nodes are horizontally scalable behind an Application Load Balancer.
- **Connection Pooling:** PostgreSQL connection pool managed via TypeORM with reasonable max connection boundaries.
- **Caching & Indexing:** Optimized composite B-Tree indexes on high-throughput columns (`userId + status`, `drawId + tier`, `score + createdAt`).
