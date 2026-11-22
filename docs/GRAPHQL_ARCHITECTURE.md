# GraphQL Architecture Specification: 13 Modular Domains

**Document Version:** 1.0.0  
**Framework:** Apollo Server 4 with Express  
**Schema Strategy:** Modular TypeDefs & Resolvers with Directive-Based RBAC  
**Pagination Standard:** Cursor-Based Relay-Compliant Connections  

---

## 1. GraphQL Pipeline & Context Design

Every incoming GraphQL operation undergoes strict context assembly and authorization checking before resolver dispatch.

```
Client Request -> Express Middleware (Auth Header, Raw Body)
               -> Apollo Server Context Builder:
                  - req / res handles
                  - Authenticated User (or null)
                  - Session Token Metadata
                  - DataLoader Registry (Users, Charities, Draws, Plans)
               -> Directive Evaluation (@auth, @hasRole)
               -> Modular Resolver Dispatch
               -> Business Service Layer Execution
               -> Standardized Response / Structured Error Handling
```

### 1.1 Apollo Context Interface
```typescript
export interface GraphQLContext {
  req: Request;
  res: Response;
  user: User | null;
  loaders: {
    userLoader: DataLoader<string, User>;
    charityLoader: DataLoader<string, Charity>;
    subscriptionPlanLoader: DataLoader<string, SubscriptionPlan>;
    drawLoader: DataLoader<string, Draw>;
    prizePoolLoader: DataLoader<string, PrizePool>;
  };
}
```

---

## 2. Standardized Pagination, Filtering & Sorting

All collection queries adhere to a standardized Connection pattern:

```graphql
interface PageInfo {
  hasNextPage: Boolean!
  hasPreviousPage: Boolean!
  startCursor: String
  endCursor: String
}

enum SortDirection {
  ASC
  DESC
}
```

---

## 3. The 13 GraphQL Modules

### 3.1 Authentication Module
Manages registration, credential login, token rotation, and password reset flows.

```graphql
type AuthPayload {
  accessToken: String!
  refreshToken: String!
  user: User!
}

input RegisterInput {
  email: String!
  password: String!
  firstName: String!
  lastName: String!
  country: String
}

input LoginInput {
  email: String!
  password: String!
}

extend type Mutation {
  register(input: RegisterInput!): AuthPayload!
  login(input: LoginInput!): AuthPayload!
  refreshToken(token: String!): AuthPayload!
  logout: Boolean! @auth
  forgotPassword(email: String!): Boolean!
  resetPassword(token: String!, newPassword: String!): Boolean!
  verifyEmail(token: String!): Boolean!
}
```

---

### 3.2 Users Module
Handles user identity, profile updates, and admin user administration.

```graphql
enum UserRole {
  PUBLIC
  SUBSCRIBER
  ADMIN
}

enum UserStatus {
  ACTIVE
  SUSPENDED
  DEACTIVATED
}

type UserProfile {
  id: ID!
  firstName: String!
  lastName: String!
  phoneNumber: String
  golfHandicap: Float
  homeClub: String
  country: String!
  avatarUrl: String
}

type User {
  id: ID!
  email: String!
  role: UserRole!
  status: UserStatus!
  isEmailVerified: Boolean!
  profile: UserProfile
  createdAt: String!
  updatedAt: String!
}

input UpdateProfileInput {
  firstName: String
  lastName: String
  phoneNumber: String
  golfHandicap: Float
  homeClub: String
  avatarUrl: String
}

extend type Query {
  me: User @auth
  users(limit: Int, cursor: String, role: UserRole, status: UserStatus): UserConnection! @hasRole(roles: [ADMIN])
  user(id: ID!): User @hasRole(roles: [ADMIN])
}

extend type Mutation {
  updateProfile(input: UpdateProfileInput!): UserProfile! @auth
  adminUpdateUserStatus(userId: ID!, status: UserStatus!): User! @hasRole(roles: [ADMIN])
}
```

---

### 3.3 Subscriptions Module
Manages subscription plans, subscriber status, and Stripe checkout sessions.

```graphql
enum PlanInterval {
  MONTH
  YEAR
}

enum SubscriptionStatus {
  TRIALING
  ACTIVE
  PAST_DUE
  CANCELED
  UNPAID
  INCOMPLETE
}

type SubscriptionPlan {
  id: ID!
  name: String!
  slug: String!
  interval: PlanInterval!
  amountCents: Int!
  currency: String!
  entriesPerDraw: Int!
  isActive: Boolean!
}

type Subscription {
  id: ID!
  plan: SubscriptionPlan!
  status: SubscriptionStatus!
  currentPeriodStart: String!
  currentPeriodEnd: String!
  cancelAtPeriodEnd: Boolean!
  canceledAt: String
}

type CheckoutSessionPayload {
  sessionId: String!
  checkoutUrl: String!
}

extend type Query {
  subscriptionPlans: [SubscriptionPlan!]!
  mySubscription: Subscription @auth
  adminSubscriptions(limit: Int, cursor: String, status: SubscriptionStatus): SubscriptionConnection! @hasRole(roles: [ADMIN])
}

extend type Mutation {
  createCheckoutSession(planId: ID!): CheckoutSessionPayload! @auth
  cancelSubscription(immediately: Boolean): Subscription! @auth
  reactivateSubscription: Subscription! @auth
}
```

---

### 3.4 Payments Module
Provides payment histories, invoice details, and financial auditing.

```graphql
enum PaymentStatus {
  PENDING
  SUCCEEDED
  FAILED
  REFUNDED
}

type Payment {
  id: ID!
  amountCents: Int!
  feeCents: Int!
  netCents: Int!
  currency: String!
  status: PaymentStatus!
  paymentMethodType: String!
  receiptUrl: String
  createdAt: String!
}

type PaymentConnection {
  edges: [PaymentEdge!]!
  pageInfo: PageInfo!
  totalCount: Int!
}

type PaymentEdge {
  cursor: String!
  node: Payment!
}

extend type Query {
  myPayments(limit: Int, cursor: String): PaymentConnection! @auth
  adminPayments(limit: Int, cursor: String, status: PaymentStatus): PaymentConnection! @hasRole(roles: [ADMIN])
}
```

---

### 3.5 Scores Module
Enforces the 1-45 score range, chronological ordering, and active 5-score limit.

```graphql
type GolfScore {
  id: ID!
  scoreValue: Int!
  playedAt: String!
  courseName: String!
  holesPlayed: Int!
  isActive: Boolean!
  archivedAt: String
  createdAt: String!
}

input SubmitScoreInput {
  scoreValue: Int!
  playedAt: String!
  courseName: String!
  holesPlayed: Int
}

input UpdateScoreInput {
  id: ID!
  scoreValue: Int
  playedAt: String
  courseName: String
  holesPlayed: Int
}

extend type Query {
  myScores(includeArchived: Boolean): [GolfScore!]! @auth
  adminUserScores(userId: ID!): [GolfScore!]! @hasRole(roles: [ADMIN])
}

extend type Mutation {
  submitScore(input: SubmitScoreInput!): GolfScore! @auth
  updateScore(input: UpdateScoreInput!): GolfScore! @auth
  deleteScore(id: ID!): Boolean! @auth
}
```

---

### 3.6 Charities Module
Directory, search, filtering, and administration of partner charities.

```graphql
type Charity {
  id: ID!
  name: String!
  slug: String!
  registrationNumber: String!
  description: String!
  category: String!
  logoUrl: String
  websiteUrl: String
  isFeatured: Boolean!
  isVerified: Boolean!
  totalReceivedCents: Int!
  currency: String!
}

type CharityConnection {
  edges: [CharityEdge!]!
  pageInfo: PageInfo!
  totalCount: Int!
}

type CharityEdge {
  cursor: String!
  node: Charity!
}

input CharityFilterInput {
  category: String
  isFeatured: Boolean
  searchQuery: String
}

input CreateCharityInput {
  name: String!
  registrationNumber: String!
  description: String!
  category: String!
  logoUrl: String
  websiteUrl: String
  isFeatured: Boolean
}

extend type Query {
  charities(limit: Int, cursor: String, filter: CharityFilterInput): CharityConnection!
  charity(id: ID, slug: String): Charity
  featuredCharities: [Charity!]!
}

extend type Mutation {
  adminCreateCharity(input: CreateCharityInput!): Charity! @hasRole(roles: [ADMIN])
  adminUpdateCharity(id: ID!, input: CreateCharityInput!): Charity! @hasRole(roles: [ADMIN])
}
```

---

### 3.7 Donations Module
Subscriber charity preference configuration (min 10%) and donation tracking.

```graphql
type UserCharityPreference {
  id: ID!
  charity: Charity!
  percentage: Float!
  isPrimary: Boolean!
}

type CharityDonation {
  id: ID!
  charity: Charity!
  amountCents: Int!
  currency: String!
  sourceType: String!
  status: String!
  createdAt: String!
}

input UpdateCharityPreferenceInput {
  charityId: ID!
  percentage: Float!
}

extend type Query {
  myCharityPreference: UserCharityPreference @auth
  myDonationHistory(limit: Int, cursor: String): [CharityDonation!]! @auth
  adminCharityDonations(charityId: ID, limit: Int, cursor: String): [CharityDonation!]! @hasRole(roles: [ADMIN])
}

extend type Mutation {
  setCharityPreference(input: UpdateCharityPreferenceInput!): UserCharityPreference! @auth
  makeDirectDonation(charityId: ID!, amountCents: Int!): CheckoutSessionPayload! @auth
}
```

---

### 3.8 Draws Module
Official monthly draw schedules, entries, winning numbers, and isolated simulations.

```graphql
enum DrawStatus {
  SCHEDULED
  EXECUTING
  PUBLISHED
  CANCELED
}

enum DrawMode {
  RANDOM
  FREQUENCY_WEIGHTED
}

type DrawResult {
  winningNumbers: [Int!]!
  drawSeedHash: String!
  algorithmMode: String!
  publishedAt: String!
}

type Draw {
  id: ID!
  drawNumber: Int!
  name: String!
  scheduledAt: String!
  executedAt: String
  status: DrawStatus!
  totalEntriesCount: Int!
  result: DrawResult
  prizePool: PrizePool
}

type DrawEntry {
  id: ID!
  draw: Draw!
  selectedNumbers: [Int!]!
  matchedNumbers: [Int!]
  matchCount: Int!
  isWinner: Boolean!
}

type DrawSimulationResult {
  id: ID!
  simulatedEntryCount: Int!
  winningNumbers: [Int!]!
  matchStatistics: JSON!
  createdAt: String!
}

input TriggerSimulationInput {
  configurationId: ID!
  simulatedEntryCount: Int!
  mode: DrawMode!
}

extend type Query {
  upcomingDraw: Draw
  pastDraws(limit: Int, cursor: String): [Draw!]!
  draw(id: ID!): Draw
  myDrawEntries(drawId: ID!): [DrawEntry!]! @auth
  drawSimulations(limit: Int): [DrawSimulationResult!]! @hasRole(roles: [ADMIN])
}

extend type Mutation {
  adminCreateDraw(name: String!, scheduledAt: String!, configurationId: ID!): Draw! @hasRole(roles: [ADMIN])
  adminExecuteDraw(drawId: ID!): Draw! @hasRole(roles: [ADMIN])
  adminRunSimulation(input: TriggerSimulationInput!): DrawSimulationResult! @hasRole(roles: [ADMIN])
}
```

---

### 3.9 Prize Pools Module
Draw prize allocation, tier calculations, and jackpot rollover rules.

```graphql
type PrizeTier {
  id: ID!
  matchCount: Int!
  allocatedPercentage: Float!
  allocatedCents: Int!
  winnerCount: Int!
  payoutPerWinnerCents: Int!
  rolloverCents: Int!
}

type PrizePool {
  id: ID!
  totalPoolCents: Int!
  rolloverInCents: Int!
  rolloverOutCents: Int!
  currency: String!
  isFinalized: Boolean!
  tiers: [PrizeTier!]!
}

extend type Query {
  drawPrizePool(drawId: ID!): PrizePool
}
```

---

### 3.10 Winners Module
Winner identification, proof submission, and administrative verification.

```graphql
enum VerificationStatus {
  PENDING
  APPROVED
  REJECTED
}

type WinnerProof {
  id: ID!
  fileUrl: String!
  fileType: String!
  submittedNotes: String
  createdAt: String!
}

type Winner {
  id: ID!
  draw: Draw!
  user: User!
  prizeTier: PrizeTier!
  prizeAmountCents: Int!
  currency: String!
  verificationStatus: VerificationStatus!
  verifiedAt: String
  rejectionReason: String
  proofs: [WinnerProof!]!
  payout: Payout
}

input SubmitWinnerProofInput {
  winnerId: ID!
  fileUrl: String!
  fileType: String!
  fileSizeBytes: Int!
  notes: String
}

extend type Query {
  myWinnings: [Winner!]! @auth
  adminPendingWinners(limit: Int, cursor: String): [Winner!]! @hasRole(roles: [ADMIN])
}

extend type Mutation {
  submitWinnerProof(input: SubmitWinnerProofInput!): WinnerProof! @auth
  adminVerifyWinner(winnerId: ID!, approve: Boolean!, rejectionReason: String): Winner! @hasRole(roles: [ADMIN])
}
```

---

### 3.11 Payouts Module
Financial disbursement tracking and payout execution.

```graphql
enum PayoutStatus {
  PENDING
  PROCESSING
  PAID
  FAILED
}

type Payout {
  id: ID!
  winner: Winner!
  amountCents: Int!
  currency: String!
  payoutMethod: String!
  payoutReference: String
  status: PayoutStatus!
  failureReason: String
  processedAt: String
  createdAt: String!
}

extend type Query {
  myPayouts: [Payout!]! @auth
  adminPayouts(limit: Int, cursor: String, status: PayoutStatus): [Payout!]! @hasRole(roles: [ADMIN])
}

extend type Mutation {
  adminProcessPayout(winnerId: ID!, payoutMethod: String!): Payout! @hasRole(roles: [ADMIN])
}
```

---

### 3.12 Notifications Module
Real-time user alerts for draw executions, wins, and billing updates.

```graphql
type Notification {
  id: ID!
  title: String!
  message: String!
  type: String!
  isRead: Boolean!
  metadata: JSON
  createdAt: String!
}

extend type Query {
  myNotifications(unreadOnly: Boolean): [Notification!]! @auth
  unreadNotificationCount: Int! @auth
}

extend type Mutation {
  markNotificationAsRead(id: ID!): Boolean! @auth
  markAllNotificationsAsRead: Boolean! @auth
}
```

---

### 3.13 Analytics & Administration Module
High-level KPIs, audit trails, and system configuration.

```graphql
type PlatformAnalytics {
  totalActiveSubscribers: Int!
  monthlyRecurringRevenueCents: Int!
  totalCharityContributedCents: Int!
  totalPrizesPaidCents: Int!
  activeDrawCount: Int!
  pendingVerificationCount: Int!
}

type AuditLog {
  id: ID!
  actor: User
  action: String!
  entityType: String!
  entityId: String!
  details: JSON!
  ipAddress: String
  createdAt: String!
}

extend type Query {
  adminAnalytics: PlatformAnalytics! @hasRole(roles: [ADMIN])
  adminAuditLogs(limit: Int, cursor: String, entityType: String): [AuditLog!]! @hasRole(roles: [ADMIN])
}
```

---

## 4. Error Handling & Validation Standards

GraphQL errors return standardized machine-readable codes within `extensions.code`:

| Error Code | HTTP Status | Description |
| :--- | :--- | :--- |
| `UNAUTHENTICATED` | 401 | Missing, expired, or invalid JWT. |
| `FORBIDDEN` | 403 | Insufficient role or access rights. |
| `BAD_USER_INPUT` | 400 | Zod schema validation failed (e.g. score out of 1-45 range). |
| `RESOURCE_NOT_FOUND` | 404 | Targeted entity UUID does not exist. |
| `CONCURRENCY_CONFLICT` | 409 | Optimistic lock or draw state mutation collision. |
| `INTERNAL_SERVER_ERROR` | 500 | Unhandled system exception (details masked in production). |
