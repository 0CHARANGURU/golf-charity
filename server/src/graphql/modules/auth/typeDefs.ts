import gql from 'graphql-tag';

export const authTypeDefs = gql`
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
    userId: ID!
    firstName: String!
    lastName: String!
    phoneNumber: String
    golfHandicap: Float
    homeClub: String
    country: String!
    addressLine1: String
    addressLine2: String
    city: String
    stateProvince: String
    postalCode: String
    avatarUrl: String
    createdAt: String!
    updatedAt: String!
  }

  type User {
    id: ID!
    email: String!
    role: UserRole!
    status: UserStatus!
    isEmailVerified: Boolean!
    stripeCustomerId: String
    profile: UserProfile
    createdAt: String!
    updatedAt: String!
  }

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

  extend type Query {
    me: User
  }

  extend type Mutation {
    register(input: RegisterInput!): AuthPayload!
    login(input: LoginInput!): AuthPayload!
    refreshToken(token: String!): AuthPayload!
    logout(refreshToken: String): Boolean!
    forgotPassword(email: String!): Boolean!
    resetPassword(token: String!, newPassword: String!): Boolean!
    verifyEmail(token: String!): Boolean!
  }
`;
