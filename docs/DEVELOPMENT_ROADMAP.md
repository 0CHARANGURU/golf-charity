# Master Development Roadmap: Phases 1 through 15

**Document Version:** 1.0.0  
**Status:** Approved for Implementation Scheduling  
**Protocol:** Incremental execution, automated testing, strict verification gates before progressing between phases.  

---

## 1. Overview of Project Phases

```
[Phase 1: Architecture & Inspection]  <-- CURRENT PHASE (COMPLETED)
                  |
[Phase 2: Project Scaffolding & Config]
                  |
[Phase 3: Database & TypeORM Migrations (22 Entities)]
                  |
[Phase 4: Authentication & RBAC Engine]
                  |
[Phase 5: GraphQL Core & 13 Modules]
                  |
[Phase 6: Stripe Subscriptions & Webhook Processing]
                  |
[Phase 7: Golf Score Engine (1-45 Validation & Archival)]
                  |
[Phase 8: Charity Directory & 10%+ Donation Engine]
                  |
[Phase 9: CSPRNG Draw Engine & Simulation Sandbox]
                  |
[Phase 10: Prize Pool Allocation & Winner Verification]
                  |
[Phase 11: Subscriber Dashboard Views & Features]
                  |
[Phase 12: Admin Dashboard Views & Controls]
                  |
[Phase 13: Public Conversion-Focused Website]
                  |
[Phase 14: Automated Testing & Security Hardening]
                  |
[Phase 15: Production Dockerization & Deployment Prep]
```

---

## 2. Detailed Phase Specifications

### Phase 1: Inspect Workspace & Finalize Architecture (CURRENT)
- **Status:** **Completed**
- **Objectives:** Inspect existing workspace, verify tools and infrastructure, design all 22 entities, propose directory layouts, document the 12 business ambiguities, and establish development standards.
- **Deliverables:**
  - `docs/PROJECT_ARCHITECTURE.md`
  - `docs/DATABASE_DESIGN.md`
  - `docs/GRAPHQL_ARCHITECTURE.md`
  - `docs/BUSINESS_RULES.md`
  - `docs/DEVELOPMENT_ROADMAP.md`
- **Gate / Exit Criteria:** Formal presentation to user and explicit user approval before Phase 2.

---

### Phase 2: Create Frontend & Backend Structures
- **Objectives:** Initialize monorepo root, client workspace, and server workspace. Establish TypeScript configurations, Vite build pipeline, Tailwind design system, Express server entry, Apollo Server bootstrap, and Docker Compose for local PostgreSQL.
- **Key Tasks:**
  1. Initialize root `package.json` with workspace management and unified npm scripts (`build`, `dev`, `test`, `lint`).
  2. Setup `docker-compose.yml` for PostgreSQL 16+ with health checks and persistent volume.
  3. Scaffold `client/` using Vite with React 18, TypeScript strict mode, Tailwind CSS (`#101827` Navy, `#C5F36A` Lime, `#252A32` Charcoal, `#F7F7F2` Off-White), PostCSS, and base folder hierarchy.
  4. Scaffold `server/` with TypeScript, Express, Apollo Server 4 skeleton, TypeORM configuration file, and domain folder hierarchy.
  5. Configure shared linting and format standards (`eslint`, `prettier`).
- **Exit Criteria:**
  - `npm run build` succeeds on both `client` and `server`.
  - Client dev server starts and renders base layout with theme colors.
  - Server boots cleanly and responds to health check endpoint `/health`.
  - PostgreSQL container connects successfully.

---

### Phase 3: PostgreSQL, TypeORM Entities & Migrations
- **Objectives:** Implement all 22 TypeORM entities with exact types, foreign keys, indexes, and write initial baseline migration.
- **Key Tasks:**
  1. Implement entity files in `server/src/entities/` for all 22 entities.
  2. Create TypeORM `DataSource` configuration with connection pooling and transaction logging.
  3. Generate and run the initial migration script (`001_initial_schema.ts`) to create all tables, unique indexes, foreign key constraints, and check constraints.
  4. Create seed scripts for subscription plans (Monthly, Annual) and initial admin credentials.
- **Exit Criteria:**
  - Migrations run cleanly from zero to latest state.
  - Migration rollback (`migration:revert`) executes without errors.
  - All foreign keys and check constraints verified against PostgreSQL database.

---

### Phase 4: Authentication & Server-Side RBAC
- **Objectives:** Build full authentication service with JWT access tokens, refresh token rotation, bcrypt password hashing, and role checks.
- **Key Tasks:**
  1. Implement `AuthService` (registration, password hashing, verification, token issuance).
  2. Implement `RefreshToken` entity logic with SHA-256 hashing, expiration, and token-family theft detection.
  3. Create Express auth middleware to parse Bearer tokens and attach context.
  4. Implement GraphQL `@auth` and `@hasRole(roles: [PUBLIC, SUBSCRIBER, ADMIN])` directives.
- **Exit Criteria:**
  - Unit tests verify password hashing, token issuance, and rotation.
  - Token theft test confirms entire family revocation when reused token is supplied.
  - Resolver guard tests confirm 401 on missing token and 403 on role mismatch.

---

### Phase 5: GraphQL API Core & 13 Modules
- **Objectives:** Implement schema definitions, query/mutation resolvers, and DataLoaders across all 13 domain modules.
- **Key Tasks:**
  1. Setup Apollo Server 4 with modular typeDefs and resolvers.
  2. Implement Relay-compliant cursor pagination utilities.
  3. Create DataLoaders for User, Charity, Draw, and SubscriptionPlan to eliminate N+1 queries.
  4. Integrate Zod schema validation into GraphQL input resolvers.
- **Exit Criteria:**
  - GraphQL schema passes introspection tests.
  - All 13 modules compile without TypeScript errors.
  - Pagination, sorting, and filtering tests return expected cursor slices.

---

### Phase 6: Stripe Subscriptions & Webhook Processing
- **Objectives:** Integrate Stripe Checkout, customer subscription lifecycle, and idempotent webhook handlers.
- **Key Tasks:**
  1. Configure Stripe SDK with environment API keys.
  2. Implement `StripeService` for customer creation, checkout sessions, and portal sessions.
  3. Implement `/webhooks/stripe` with raw body signature verification.
  4. Handle lifecycle events: `checkout.session.completed`, `customer.subscription.created/updated/deleted`, `invoice.paid`, `invoice.payment_failed`.
  5. Enforce idempotency using `Payment` table records.
- **Exit Criteria:**
  - Simulated webhook test suite passes with 100% idempotency verification.
  - Failed payments trigger past-due status transitions.

---

### Phase 7: Golf Score Management Engine
- **Objectives:** Implement concurrency-safe score submission, validation, and FIFO archival.
- **Key Tasks:**
  1. Implement `GolfScoreService` validating scores strictly within 1 to 45.
  2. Enforce date required and validate non-future dates.
  3. Implement transaction-safe active score count enforcement: when score 6 is inserted, the oldest active score is archived.
  4. Build score editing and deletion capabilities with audit logging.
- **Exit Criteria:**
  - Concurrency test with 10 simultaneous score submissions never leaves more than 5 active scores.
  - Invalid scores (<1 or >45) rejected with `BAD_USER_INPUT`.

---

### Phase 8: Charity Directory & Donation Allocation Engine
- **Objectives:** Implement charity catalog, subscriber allocation preferences (min 10%), and direct donations.
- **Key Tasks:**
  1. Seed initial verified charities across multiple categories.
  2. Build charity search, category filtering, and slug lookup resolvers.
  3. Implement `UserCharityPreference` validation enforcing $\ge 10.00\%$.
  4. Implement subscription fee allocation breakdown ledger (`CharityDonation`).
- **Exit Criteria:**
  - Attempting to set allocation <10% throws a validation error.
  - Ledger entries correctly record gross/net allocations in integer cents.

---

### Phase 9: Cryptographic Draw Engine & Simulation Sandbox
- **Objectives:** Build the core draw engine with CSPRNG, frequency-weighted mode, and isolated simulation sandbox.
- **Key Tasks:**
  1. Implement `cryptoRng` utility using Node.js `crypto.randomInt`.
  2. Implement Uniform Random Mode and Frequency-Weighted Mode.
  3. Implement `DrawSimulationService` ensuring simulations never touch official tables.
  4. Implement official draw execution scheduler and winner matching logic (3, 4, 5 matches).
- **Exit Criteria:**
  - Zero occurrences of `Math.random()` in codebase.
  - 10,000-draw simulation executes in sandbox with complete match distribution statistics and zero side-effects on official draw tables.

---

### Phase 10: Prize Pool Allocation, Winners & Payouts
- **Objectives:** Calculate equal winner splits, rollover unwon tiers, handle scorecard proof uploads, and record payouts.
- **Key Tasks:**
  1. Implement `PrizePoolService` splitting pool across 5-match (40%), 4-match (35%), and 3-match (25%) tiers.
  2. Implement integer-safe equal division and rollover of remainder/unwon funds.
  3. Implement winner identification and in-app notification dispatch.
  4. Implement proof upload endpoint, admin approval workflow, and payout disbursement tracking.
- **Exit Criteria:**
  - Automated tests confirm zero penny leaks across split calculations.
  - Rollover logic verified when tiers produce 0 winners.

---

### Phase 11: Subscriber Dashboard
- **Objectives:** Build the responsive subscriber portal using React, Apollo Client, Tailwind CSS, and Framer Motion.
- **Key Tasks:**
  1. Build Overview dashboard with next draw countdown, active scores summary, chosen charity, and win alerts.
  2. Build Golf Scores management view (submit score modal, active 5 scores display, archived scores drawer).
  3. Build Draw History & Winnings view with match breakdown visualizer.
  4. Build My Charity selection view with percentage slider (10% - 100%).
  5. Build Subscription & Billing management view (Stripe billing portal link, plan change).
  6. Build Profile & Notification drawer.
- **Exit Criteria:**
  - Subscriber can perform all core actions end-to-end in the UI.
  - Mobile, tablet, and desktop responsive validation.

---

### Phase 12: Admin Dashboard
- **Objectives:** Build administrative management panels for draws, simulations, charities, winner verifications, and financial reports.
- **Key Tasks:**
  1. Build Analytics KPI overview (MRR, active subscribers, charity raised, payouts).
  2. Build Draw Management panel (schedule draw, execute draw, view entries).
  3. Build Draw Simulation visualizer with statistical outcome histograms.
  4. Build Winner Verification queue (inspect submitted proof scorecards, approve/reject).
  5. Build Payouts execution panel and Audit Log explorer.
- **Exit Criteria:**
  - Admin can run simulations, execute draws, and review winner proofs in the UI.
  - Non-admin users are blocked from admin routes by route guards.

---

### Phase 13: Public Website
- **Objectives:** Build high-converting, accessible public website with dark fintech aesthetic.
- **Key Tasks:**
  1. Build Hero section with value proposition, live jackpot counter, and CTA buttons.
  2. Build "How It Works" interactive step progression.
  3. Build Subscription Plans pricing cards with Monthly/Annual toggle.
  4. Build Public Charity Directory with search and category filters.
  5. Build Draw Information & Past Results explorer.
  6. Build FAQ accordion, Contact Form, and Footer navigation.
- **Exit Criteria:**
  - Lighthouse accessibility score $\ge 95$.
  - Seamless navigation and conversion funnel to registration.

---

### Phase 14: Automated Testing & Security Hardening
- **Objectives:** Comprehensive test suite, security scans, and error boundary verification.
- **Key Tasks:**
  1. Unit tests for all services (score archival, draw math, currency splits, auth tokens).
  2. Integration tests for GraphQL mutations and Stripe webhooks.
  3. Security audit: Rate limiting, SQL injection tests, XSS mitigation, JWT expiration.
  4. Error boundary and loading state audits across frontend.
- **Exit Criteria:**
  - All automated test suites passing.
  - Zero critical security vulnerabilities detected.

---

### Phase 15: Deployment Preparation
- **Objectives:** Production containerization, environment verification, and operational documentation.
- **Key Tasks:**
  1. Multi-stage Dockerfiles for client (Nginx) and server (Node.js Alpine).
  2. Production docker-compose with PostgreSQL and automated migration runner.
  3. Production environment variable templates and checklist.
  4. Complete system documentation in root `README.md`.
- **Exit Criteria:**
  - Production build containers run cleanly in Docker without errors.
  - Database migrations auto-execute on startup.
