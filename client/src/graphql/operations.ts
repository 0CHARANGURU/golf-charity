import { gql } from '@apollo/client';

export const LOGIN_MUTATION = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      accessToken
      refreshToken
      user {
        id
        email
        role
        status
        isEmailVerified
        profile {
          firstName
          lastName
          country
          golfHandicap
          homeClub
        }
      }
    }
  }
`;

export const REGISTER_MUTATION = gql`
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      accessToken
      refreshToken
      user {
        id
        email
        role
        status
        profile {
          firstName
          lastName
          country
        }
      }
    }
  }
`;

export const GET_ME_QUERY = gql`
  query GetMe {
    me {
      id
      email
      role
      status
      profile {
        firstName
        lastName
        golfHandicap
        homeClub
        country
        phoneNumber
      }
    }
  }
`;

export const GET_MY_SCORES_QUERY = gql`
  query GetMyScores($includeArchived: Boolean) {
    myScores(includeArchived: $includeArchived) {
      id
      scoreValue
      playedAt
      courseName
      holesPlayed
      isActive
      archivedAt
      createdAt
    }
  }
`;

export const SUBMIT_SCORE_MUTATION = gql`
  mutation SubmitScore($input: SubmitScoreInput!) {
    submitScore(input: $input) {
      id
      scoreValue
      playedAt
      courseName
      holesPlayed
      isActive
    }
  }
`;

export const UPDATE_SCORE_MUTATION = gql`
  mutation UpdateScore($input: UpdateScoreInput!) {
    updateScore(input: $input) {
      id
      scoreValue
      playedAt
      courseName
      holesPlayed
      isActive
    }
  }
`;

export const DELETE_SCORE_MUTATION = gql`
  mutation DeleteScore($id: ID!) {
    deleteScore(id: $id)
  }
`;

export const GET_CHARITIES_QUERY = gql`
  query GetCharities($filter: CharityFilterInput) {
    charities(filter: $filter) {
      totalCount
      charities {
        id
        name
        slug
        registrationNumber
        description
        category
        logoUrl
        websiteUrl
        isFeatured
        totalReceivedCents
        currency
      }
    }
  }
`;

export const GET_MY_CHARITY_PREF_QUERY = gql`
  query GetMyCharityPreference {
    myCharityPreference {
      id
      percentage
      charity {
        id
        name
        category
        description
        logoUrl
        websiteUrl
      }
    }
  }
`;

export const SET_CHARITY_PREF_MUTATION = gql`
  mutation SetCharityPreference($charityId: ID!, $percentage: Float!) {
    setCharityPreference(charityId: $charityId, percentage: $percentage) {
      id
      percentage
      charity {
        id
        name
      }
    }
  }
`;

export const GET_UPCOMING_DRAW_QUERY = gql`
  query GetUpcomingDraw {
    upcomingDraw {
      id
      drawNumber
      name
      scheduledAt
      status
      totalEntriesCount
      prizePool {
        totalPoolCents
        currency
        tiers {
          matchCount
          allocatedPercentage
          allocatedCents
          winnerCount
        }
      }
    }
  }
`;

export const GET_PAST_DRAWS_QUERY = gql`
  query GetPastDraws($limit: Int) {
    pastDraws(limit: $limit) {
      id
      drawNumber
      name
      executedAt
      totalEntriesCount
      result {
        winningNumbers
        drawSeedHash
        algorithmMode
        publishedAt
      }
      prizePool {
        totalPoolCents
        tiers {
          matchCount
          winnerCount
          payoutPerWinnerCents
        }
      }
    }
  }
`;

export const GET_MY_DRAW_ENTRIES_QUERY = gql`
  query GetMyDrawEntries($drawId: ID!) {
    myDrawEntries(drawId: $drawId) {
      id
      selectedNumbers
      matchedNumbers
      matchCount
      isWinner
      createdAt
    }
  }
`;

export const GET_MY_WINNINGS_QUERY = gql`
  query GetMyWinnings {
    myWinnings {
      id
      prizeAmountCents
      currency
      verificationStatus
      rejectionReason
      draw {
        id
        drawNumber
        name
        executedAt
      }
      prizeTier {
        matchCount
      }
      proofs {
        id
        fileUrl
        createdAt
      }
      payout {
        status
        payoutMethod
        payoutReference
        processedAt
      }
    }
  }
`;

export const SUBMIT_PROOF_MUTATION = gql`
  mutation SubmitWinnerProof($input: SubmitWinnerProofInput!) {
    submitWinnerProof(input: $input) {
      id
      fileUrl
      createdAt
    }
  }
`;

export const GET_SUBSCRIPTION_PLANS_QUERY = gql`
  query GetSubscriptionPlans {
    subscriptionPlans {
      id
      stripePriceId
      name
      slug
      interval
      amountCents
      currency
      entriesPerDraw
      isActive
    }
  }
`;

export const GET_MY_SUBSCRIPTION_QUERY = gql`
  query GetMySubscription {
    mySubscription {
      id
      status
      currentPeriodStart
      currentPeriodEnd
      cancelAtPeriodEnd
      plan {
        id
        name
        interval
        amountCents
        currency
      }
    }
  }
`;

export const CREATE_CHECKOUT_SESSION_MUTATION = gql`
  mutation CreateCheckoutSession($planId: ID!) {
    createCheckoutSession(planId: $planId) {
      sessionId
      checkoutUrl
    }
  }
`;

export const SYNC_CHECKOUT_SESSION_MUTATION = gql`
  mutation SyncCheckoutSession($sessionId: String!) {
    syncCheckoutSession(sessionId: $sessionId) {
      id
      status
      currentPeriodStart
      currentPeriodEnd
      plan {
        id
        name
        interval
        amountCents
      }
    }
  }
`;

export const GET_MY_NOTIFICATIONS_QUERY = gql`
  query GetMyNotifications($unreadOnly: Boolean) {
    myNotifications(unreadOnly: $unreadOnly) {
      id
      title
      message
      type
      isRead
      createdAt
    }
  }
`;

// Admin GraphQL operations
export const GET_ADMIN_ANALYTICS_QUERY = gql`
  query GetAdminAnalytics {
    adminAnalytics {
      totalSubscribers
      monthlyRecurringRevenueCents
      totalCharityRaisedCents
      totalPrizesDisbursedCents
      totalActiveScores
      upcomingDrawCount
      pendingVerificationsCount
    }
  }
`;

export const GET_ADMIN_PENDING_WINNERS_QUERY = gql`
  query GetAdminPendingWinners {
    adminPendingWinners {
      id
      prizeAmountCents
      currency
      verificationStatus
      user {
        email
        profile {
          firstName
          lastName
        }
      }
      draw {
        drawNumber
        name
      }
      prizeTier {
        matchCount
      }
      proofs {
        id
        fileUrl
        fileType
        submittedNotes
        createdAt
      }
    }
  }
`;

export const ADMIN_VERIFY_WINNER_MUTATION = gql`
  mutation AdminVerifyWinner($winnerId: ID!, $approve: Boolean!, $rejectionReason: String) {
    adminVerifyWinner(winnerId: $winnerId, approve: $approve, rejectionReason: $rejectionReason) {
      id
      verificationStatus
      rejectionReason
    }
  }
`;

export const ADMIN_PROCESS_PAYOUT_MUTATION = gql`
  mutation AdminProcessPayout($winnerId: ID!, $payoutMethod: String) {
    adminProcessPayout(winnerId: $winnerId, payoutMethod: $payoutMethod) {
      id
      status
      payoutReference
      amountCents
    }
  }
`;

export const ADMIN_RUN_SIMULATION_MUTATION = gql`
  mutation AdminRunSimulation($configurationId: ID!, $count: Int!, $mode: DrawMode) {
    adminRunSimulation(configurationId: $configurationId, count: $count, mode: $mode) {
      id
      name
      simulatedEntryCount
      winningNumbers
      simulationStats
      createdAt
    }
  }
`;

export const GET_DRAW_CONFIGURATIONS_QUERY = gql`
  query GetDrawConfigurations {
    drawConfigurations {
      id
      name
      drawMode
      minNumber
      maxNumber
      numbersDrawnCount
      prizeDistribution5Match
      prizeDistribution4Match
      prizeDistribution3Match
    }
  }
`;

export const ADMIN_EXECUTE_DRAW_MUTATION = gql`
  mutation AdminExecuteDraw($drawId: ID!) {
    adminExecuteDraw(drawId: $drawId) {
      id
      status
      result {
        winningNumbers
      }
    }
  }
`;
