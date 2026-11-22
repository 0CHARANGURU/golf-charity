import gql from 'graphql-tag';

export const winningsTypeDefs = gql`
  enum VerificationStatus {
    PENDING
    APPROVED
    REJECTED
  }

  enum PayoutStatus {
    PENDING
    PROCESSING
    PAID
    FAILED
  }

  type WinnerProof {
    id: ID!
    winnerId: ID!
    fileUrl: String!
    fileType: String!
    fileSizeBytes: Int!
    submittedNotes: String
    createdAt: String!
  }

  type Payout {
    id: ID!
    winnerId: ID!
    userId: ID!
    amountCents: Int!
    currency: String!
    payoutMethod: String!
    payoutReference: String
    status: PayoutStatus!
    failureReason: String
    processedAt: String
    createdAt: String!
  }

  type Winner {
    id: ID!
    drawId: ID!
    draw: Draw
    drawEntryId: ID!
    prizeTierId: ID!
    prizeTier: PrizeTier
    userId: ID!
    user: User
    prizeAmountCents: Int!
    currency: String!
    verificationStatus: VerificationStatus!
    verifiedAt: String
    rejectionReason: String
    proofs: [WinnerProof!]
    payout: Payout
    createdAt: String!
  }

  type Notification {
    id: ID!
    userId: ID!
    title: String!
    message: String!
    type: String!
    isRead: Boolean!
    metadata: JSON
    createdAt: String!
  }

  input SubmitWinnerProofInput {
    winnerId: ID!
    fileUrl: String!
    fileType: String!
    fileSizeBytes: Int!
    notes: String
  }

  extend type Query {
    myWinnings: [Winner!]!
    myPayouts: [Payout!]!
    myNotifications(unreadOnly: Boolean): [Notification!]!
    adminPendingWinners: [Winner!]!
    adminPayouts(status: PayoutStatus): [Payout!]!
  }

  extend type Mutation {
    submitWinnerProof(input: SubmitWinnerProofInput!): WinnerProof!
    adminVerifyWinner(winnerId: ID!, approve: Boolean!, rejectionReason: String): Winner!
    adminProcessPayout(winnerId: ID!, payoutMethod: String): Payout!
    markNotificationAsRead(id: ID!): Boolean!
  }
`;
