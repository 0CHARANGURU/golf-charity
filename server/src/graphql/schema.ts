import gql from 'graphql-tag';
import { authTypeDefs } from './modules/auth/typeDefs';
import { authResolvers } from './modules/auth/resolvers';
import { scoresTypeDefs } from './modules/scores/typeDefs';
import { scoresResolvers } from './modules/scores/resolvers';
import { charitiesTypeDefs } from './modules/charities/typeDefs';
import { charitiesResolvers } from './modules/charities/resolvers';
import { drawsTypeDefs } from './modules/draws/typeDefs';
import { drawsResolvers } from './modules/draws/resolvers';
import { winningsTypeDefs } from './modules/winnings/typeDefs';
import { winningsResolvers } from './modules/winnings/resolvers';
import { subscriptionsTypeDefs } from './modules/subscriptions/typeDefs';
import { subscriptionsResolvers } from './modules/subscriptions/resolvers';
import { analyticsTypeDefs } from './modules/analytics/typeDefs';
import { analyticsResolvers } from './modules/analytics/resolvers';

const baseTypeDefs = gql`
  type Query {
    healthCheck: HealthStatus!
    platformInfo: PlatformInfo!
  }

  type Mutation {
    _empty: String
  }

  type HealthStatus {
    status: String!
    timestamp: String!
    uptime: Float!
    environment: String!
  }

  type PlatformInfo {
    name: String!
    version: String!
    currency: String!
    minCharityPercentage: Float!
    maxActiveScores: Int!
  }
`;

const baseResolvers = {
  Query: {
    healthCheck: () => ({
      status: 'UP',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
    }),
    platformInfo: () => ({
      name: 'Golf Charity Subscription Platform',
      version: '1.0.0',
      currency: 'USD',
      minCharityPercentage: 10.0,
      maxActiveScores: 5,
    }),
  },
};

export const typeDefs = [
  baseTypeDefs,
  authTypeDefs,
  scoresTypeDefs,
  charitiesTypeDefs,
  drawsTypeDefs,
  winningsTypeDefs,
  subscriptionsTypeDefs,
  analyticsTypeDefs,
];

export const resolvers = {
  Query: {
    ...baseResolvers.Query,
    ...authResolvers.Query,
    ...scoresResolvers.Query,
    ...charitiesResolvers.Query,
    ...drawsResolvers.Query,
    ...winningsResolvers.Query,
    ...subscriptionsResolvers.Query,
    ...analyticsResolvers.Query,
  },
  Mutation: {
    ...authResolvers.Mutation,
    ...scoresResolvers.Mutation,
    ...charitiesResolvers.Mutation,
    ...drawsResolvers.Mutation,
    ...winningsResolvers.Mutation,
    ...subscriptionsResolvers.Mutation,
  },
};
