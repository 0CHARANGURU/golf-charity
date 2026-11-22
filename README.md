# Golf Charity Subscription Platform

[![Architecture Specification](https://img.shields.io/badge/Architecture-Phase%201%20to%2015-C5F36A?style=for-the-badge&logo=graphql&logoColor=101827)](./docs/PROJECT_ARCHITECTURE.md)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict%20Mode-101827?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16%2B%20ACID-336791?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![GraphQL](https://img.shields.io/badge/Apollo%20Server-4.x-E10098?style=for-the-badge&logo=apollographql&logoColor=white)](https://www.apollographql.com/)

A fintech-grade, full-stack subscription platform that connects amateur golf participation, certified non-profit philanthropy, and recurring cash prize draws. Subscribers maintain active Stableford golf scores (1–45 range), nominate verified charities with a guaranteed minimum 10% contribution, and enter audited monthly prize draws powered by cryptographic randomness.

---

## 1. System Architecture Overview

```
                                  +-----------------------+
                                  |   React + Vite SPA    |
                                  |   Apollo Client 3     |
                                  +-----------------------+
                                              |
                                    HTTPS/WSS | GraphQL
                                              v
                                  +-----------------------+
                                  |    Express Server     |
                                  |    Apollo Server 4    |
                                  +-----------------------+
                                              |
                   +--------------------------+--------------------------+
                   |                          |                          |
                   v                          v                          v
        +--------------------+      +--------------------+      +--------------------+
        | Auth & RBAC Engine |      | Cryptographic Draw |      | Stripe Webhook &   |
        | JWT + Rotation     |      | Engine (CSPRNG)    |      | Charity Engine     |
        +--------------------+      +--------------------+      +--------------------+
                   |                          |                          |
                   +--------------------------+--------------------------+
                                              |
                                              v
                                  +-----------------------+
                                  |  PostgreSQL Database  |
                                  |  22 TypeORM Entities  |
                                  +-----------------------+
```

### Visual & Design System
- **Navy (`#101827`)**: Primary deep fintech background.
- **Electric Lime (`#C5F36A`)**: Primary call-to-action, active indicators, and winner badges.
- **Charcoal (`#252A32`)**: Card surfaces, modal containers, and contrast elements.
- **Off-White (`#F7F7F2`)**: High-legibility typography with JetBrains Mono numbers.

---

## 2. Core Business Rules & Financial Integrity

1. **Golf Score Rules:**
   - Score values strictly validated between `1` and `45` points.
   - Requires non-future date of play.
   - At most **5 active scores** per subscriber.
   - **FIFO Archival:** When a 6th score is submitted, the oldest active score is automatically archived.
   - Pessimistic row locking (`pessimistic_write`) guarantees concurrency safety.

2. **Audited Monthly Draws:**
   - Categories: 3-number match, 4-number match, 5-number match (Jackpot).
   - Random mode utilizes Node.js operating system CSPRNG (`crypto.randomInt`). Zero `Math.random()`.
   - Frequency-weighted mode samples probabilities proportional to empirical score frequencies.
   - **Simulation Isolation:** Administrative simulations execute purely in-memory and write exclusively to `draw_simulations`. Official draw tables, user balances, and notifications are 100% isolated.

3. **Prize Pool & Financial Allocations:**
   - 64-bit integer minor currency units (`BIGINT` e.g., cents/pence).
   - Tier splits: 5-Match (40%), 4-Match (35%), 3-Match (25%).
   - Equal split among tier winners. Any fractional remainder cents remain in the rollover reserve.
   - **Jackpot Rollover:** 100% of unwon tier allocations roll over into the next monthly draw.

4. **Philanthropy & Non-Profit Allocation:**
   - Minimum **10.00%** mandatory contribution to a certified charity.
   - Configurable percentage slider up to **100.00%** (Pure Philanthropy).
   - Independent one-off direct donations supported.

5. **Winner Verification & Payouts:**
   - Draw published $\to$ Winner identified $\to$ In-app notification $\to$ Proof uploaded $\to$ Admin review $\to$ Approved $\to$ Payout disbursed.
   - Duplicate payout prevention enforced by unique database constraints and audit logs.

---

## 3. The 22 Relational Entities

| Category | Entities |
| :--- | :--- |
| **Authentication & Users** | `User`, `UserProfile`, `RefreshToken`, `AuditLog` |
| **Subscriptions & Billing** | `SubscriptionPlan`, `Subscription`, `Payment` |
| **Golf Scores** | `GolfScore` (1–45 range, FIFO archival) |
| **Philanthropy** | `Charity`, `UserCharityPreference` ($\ge 10\%$), `CharityDonation` |
| **Draw Engine** | `DrawConfiguration`, `Draw`, `DrawResult`, `DrawEntry`, `DrawSimulation` |
| **Prizes & Disbursements** | `PrizePool`, `PrizeTier`, `Winner`, `WinnerProof`, `Payout`, `Notification` |

---

## 4. Getting Started & Local Development

### Prerequisites
- Node.js 20+ or 22 LTS
- PostgreSQL 16+ (or Docker)
- npm 10+

### 1. Clone & Install Dependencies
```bash
git clone <repo-url> golf_charity
cd golf_charity

# Install monorepo dependencies across client and server
npm install
```

### 2. Environment Configuration
Create `.env` in `server/`:
```env
NODE_ENV=development
PORT=4000
CLIENT_ORIGIN=http://localhost:5173

# Database Connection
DB_HOST=localhost
DB_PORT=5432
DB_USER=system
DB_PASSWORD=system
DB_NAME=golf_charity
DB_LOGGING=false

# Authentication
JWT_ACCESS_SECRET=your_jwt_access_secret_minimum_32_characters
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your_jwt_refresh_secret_minimum_32_characters
JWT_REFRESH_EXPIRES_IN=30d

# Stripe
STRIPE_SECRET_KEY=sk_test_placeholder
STRIPE_WEBHOOK_SECRET=whsec_placeholder
STRIPE_SUCCESS_URL=http://localhost:5173/dashboard/subscriptions?session_id={CHECKOUT_SESSION_ID}
STRIPE_CANCEL_URL=http://localhost:5173/plans
```

Create `.env` in `client/`:
```env
VITE_GRAPHQL_ENDPOINT=http://localhost:4000/graphql
VITE_API_URL=http://localhost:4000
VITE_STRIPE_PUBLIC_KEY=pk_test_placeholder_key
```

### 3. Database Migration & Seed Baseline
```bash
# Run TypeORM migrations to create all 22 tables and check constraints
cd server
npm run migration:run

# Seed default plans, partner charities, draw configuration, and admin user
npx ts-node src/database/seeds/seed.ts
```

*Default Seeded Admin:*
- **Email:** `admin@golfcharity.com`
- **Password:** `AdminPassword123!`

---

## 5. Verification & Test Suite

The platform includes comprehensive automated test runners verifying every domain engine:

```bash
# 1. Typecheck both client and server
npm run typecheck

# 2. Build production bundles
npm run build

# 3. Run Server Health & GraphQL test
cd server && npx ts-node tests/phase2Verification.ts

# 4. Run Database Schema & Constraint verification
npx ts-node tests/phase3Verification.ts

# 5. Run Authentication, Token Rotation & RBAC test
npx ts-node tests/phase4Verification.ts

# 6. Run Full Engine Verification (Scores, Charity, Draws, Webhooks, Winners, Payouts)
npx ts-node tests/phase5To10Verification.ts
```

---

## 6. Running the Applications

### Development Mode
```bash
# Terminal 1: Run Backend API (http://localhost:4000)
npm run dev:server

# Terminal 2: Run Frontend Client (http://localhost:5173)
npm run dev:client
```

### Production Docker Deployment
```bash
# Build and run complete production stack (Nginx SPA + Express API + PostgreSQL)
docker-compose -f docker-compose.prod.yml up --build -d
```

---

## 7. Architectural Documentation Links

- [PROJECT_ARCHITECTURE.md](./docs/PROJECT_ARCHITECTURE.md): Global system architecture, security standards, and tech stack rationale.
- [DATABASE_DESIGN.md](./docs/DATABASE_DESIGN.md): Detailed specification of all 22 entities, relationships, indexes, and transactions.
- [GRAPHQL_ARCHITECTURE.md](./docs/GRAPHQL_ARCHITECTURE.md): Schema definitions, Relay pagination, directives, and error codes.
- [BUSINESS_RULES.md](./docs/BUSINESS_RULES.md): Golf scoring, draw engine mathematical algorithms, and financial rules.
- [DEVELOPMENT_ROADMAP.md](./docs/DEVELOPMENT_ROADMAP.md): Complete phase-by-phase execution roadmap.

---

## License
UNLICENSED © Golf Charity Platform Team
