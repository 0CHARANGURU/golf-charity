import gql from 'graphql-tag';

export const analyticsTypeDefs = gql`
  type PlatformAnalytics {
    totalSubscribers: Int!
    monthlyRecurringRevenueCents: Int!
    totalCharityRaisedCents: Int!
    totalPrizesDisbursedCents: Int!
    totalActiveScores: Int!
    upcomingDrawCount: Int!
    pendingVerificationsCount: Int!
  }

  type AuditLog {
    id: ID!
    actorUserId: ID
    actor: User
    action: String!
    entityType: String!
    entityId: String!
    details: JSON!
    ipAddress: String
    createdAt: String!
  }

  extend type Query {
    adminAnalytics: PlatformAnalytics!
    adminAuditLogs(limit: Int): [AuditLog!]!
  }
`;
