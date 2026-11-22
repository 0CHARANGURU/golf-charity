import gql from 'graphql-tag';

export const drawsTypeDefs = gql`
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

  type DrawConfiguration {
    id: ID!
    name: String!
    drawMode: DrawMode!
    minNumber: Int!
    maxNumber: Int!
    numbersDrawnCount: Int!
    prizeDistribution5Match: Float!
    prizeDistribution4Match: Float!
    prizeDistribution3Match: Float!
    rolloverUnclaimed: Boolean!
    isActive: Boolean!
  }

  type DrawResult {
    id: ID!
    drawId: ID!
    winningNumbers: [Int!]!
    drawSeedHash: String!
    algorithmMode: String!
    publishedAt: String!
  }

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
    drawId: ID!
    totalPoolCents: Int!
    rolloverInCents: Int!
    rolloverOutCents: Int!
    currency: String!
    isFinalized: Boolean!
    tiers: [PrizeTier!]
  }

  type Draw {
    id: ID!
    drawConfigurationId: ID!
    configuration: DrawConfiguration
    drawNumber: Int!
    name: String!
    scheduledAt: String!
    executedAt: String
    status: DrawStatus!
    totalEntriesCount: Int!
    result: DrawResult
    prizePool: PrizePool
    createdAt: String!
  }

  type DrawEntry {
    id: ID!
    drawId: ID!
    userId: ID!
    selectedNumbers: [Int!]!
    matchedNumbers: [Int!]
    matchCount: Int!
    isWinner: Boolean!
    createdAt: String!
  }

  type DrawSimulation {
    id: ID!
    name: String!
    simulatedEntryCount: Int!
    winningNumbers: [Int!]!
    simulationStats: JSON!
    createdAt: String!
  }

  scalar JSON

  extend type Query {
    upcomingDraw: Draw
    pastDraws(limit: Int): [Draw!]!
    draw(id: ID!): Draw
    myDrawEntries(drawId: ID!): [DrawEntry!]!
    drawConfigurations: [DrawConfiguration!]!
  }

  extend type Mutation {
    adminCreateDraw(name: String!, scheduledAt: String!, configurationId: ID!): Draw!
    adminExecuteDraw(drawId: ID!): Draw!
    adminRunSimulation(configurationId: ID!, count: Int!, mode: DrawMode): DrawSimulation!
  }
`;
