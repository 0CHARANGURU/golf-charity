import gql from 'graphql-tag';

export const charitiesTypeDefs = gql`
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
    createdAt: String!
  }

  type CharityListResult {
    charities: [Charity!]!
    totalCount: Int!
  }

  type UserCharityPreference {
    id: ID!
    userId: ID!
    charityId: ID!
    charity: Charity!
    percentage: Float!
    isPrimary: Boolean!
    createdAt: String!
  }

  type CharityDonation {
    id: ID!
    charityId: ID!
    amountCents: Int!
    currency: String!
    sourceType: String!
    status: String!
    createdAt: String!
  }

  input CharityFilterInput {
    category: String
    isFeatured: Boolean
    searchQuery: String
    limit: Int
    offset: Int
  }

  extend type Query {
    charities(filter: CharityFilterInput): CharityListResult!
    charity(id: ID, slug: String): Charity
    myCharityPreference: UserCharityPreference
  }

  extend type Mutation {
    setCharityPreference(charityId: ID!, percentage: Float!): UserCharityPreference!
  }
`;
