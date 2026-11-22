import gql from 'graphql-tag';

export const scoresTypeDefs = gql`
  type GolfScore {
    id: ID!
    userId: ID!
    scoreValue: Int!
    playedAt: String!
    courseName: String!
    holesPlayed: Int!
    isActive: Boolean!
    archivedAt: String
    createdAt: String!
    updatedAt: String!
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
    myScores(includeArchived: Boolean): [GolfScore!]!
  }

  extend type Mutation {
    submitScore(input: SubmitScoreInput!): GolfScore!
    updateScore(input: UpdateScoreInput!): GolfScore!
    deleteScore(id: ID!): Boolean!
  }
`;
