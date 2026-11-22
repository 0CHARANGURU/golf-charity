export enum UserRole {
  PUBLIC = 'PUBLIC',
  SUBSCRIBER = 'SUBSCRIBER',
  ADMIN = 'ADMIN',
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  DEACTIVATED = 'DEACTIVATED',
}

export enum SubscriptionStatus {
  TRIALING = 'TRIALING',
  ACTIVE = 'ACTIVE',
  PAST_DUE = 'PAST_DUE',
  CANCELED = 'CANCELED',
  UNPAID = 'UNPAID',
  INCOMPLETE = 'INCOMPLETE',
}

export enum PlanInterval {
  MONTH = 'MONTH',
  YEAR = 'YEAR',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  SUCCEEDED = 'SUCCEEDED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

export enum DrawStatus {
  SCHEDULED = 'SCHEDULED',
  EXECUTING = 'EXECUTING',
  PUBLISHED = 'PUBLISHED',
  CANCELED = 'CANCELED',
}

export enum DrawMode {
  RANDOM = 'RANDOM',
  FREQUENCY_WEIGHTED = 'FREQUENCY_WEIGHTED',
}

export enum VerificationStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export enum PayoutStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  PAID = 'PAID',
  FAILED = 'FAILED',
}
