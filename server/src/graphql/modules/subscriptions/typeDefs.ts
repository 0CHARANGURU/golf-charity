import gql from 'graphql-tag';

export const subscriptionsTypeDefs = gql`
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

  enum PaymentStatus {
    PENDING
    SUCCEEDED
    FAILED
    REFUNDED
  }

  type SubscriptionPlan {
    id: ID!
    stripePriceId: String!
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
    planId: ID!
    plan: SubscriptionPlan
    status: SubscriptionStatus!
    currentPeriodStart: String!
    currentPeriodEnd: String!
    cancelAtPeriodEnd: Boolean!
    canceledAt: String
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

  type CheckoutSessionPayload {
    sessionId: String!
    checkoutUrl: String!
  }

  extend type Query {
    subscriptionPlans: [SubscriptionPlan!]!
    mySubscription: Subscription
    myPayments: [Payment!]!
    adminSubscriptions(status: SubscriptionStatus): [Subscription!]!
  }

  extend type Mutation {
    createCheckoutSession(planId: ID!): CheckoutSessionPayload!
    syncCheckoutSession(sessionId: String!): Subscription!
  }
`;
