import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1700000000001 implements MigrationInterface {
  name = 'InitialSchema1700000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Extensions
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);

    // 2. ENUMs
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "user_role_enum" AS ENUM ('PUBLIC', 'SUBSCRIBER', 'ADMIN');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "user_status_enum" AS ENUM ('ACTIVE', 'SUSPENDED', 'DEACTIVATED');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "plan_interval_enum" AS ENUM ('MONTH', 'YEAR');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "subscription_status_enum" AS ENUM ('TRIALING', 'ACTIVE', 'PAST_DUE', 'CANCELED', 'UNPAID', 'INCOMPLETE');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "payment_status_enum" AS ENUM ('PENDING', 'SUCCEEDED', 'FAILED', 'REFUNDED');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "draw_status_enum" AS ENUM ('SCHEDULED', 'EXECUTING', 'PUBLISHED', 'CANCELED');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "draw_mode_enum" AS ENUM ('RANDOM', 'FREQUENCY_WEIGHTED');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "verification_status_enum" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "payout_status_enum" AS ENUM ('PENDING', 'PROCESSING', 'PAID', 'FAILED');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // 3. Tables
    // users
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "users" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "email" VARCHAR(255) NOT NULL UNIQUE,
        "password_hash" VARCHAR(255) NOT NULL,
        "role" "user_role_enum" NOT NULL DEFAULT 'SUBSCRIBER',
        "is_email_verified" BOOLEAN NOT NULL DEFAULT false,
        "verification_token" VARCHAR(255),
        "password_reset_token" VARCHAR(255),
        "password_reset_expires_at" TIMESTAMPTZ,
        "stripe_customer_id" VARCHAR(255) UNIQUE,
        "status" "user_status_enum" NOT NULL DEFAULT 'ACTIVE',
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    // user_profiles
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "user_profiles" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "user_id" UUID NOT NULL UNIQUE REFERENCES "users"("id") ON DELETE CASCADE,
        "first_name" VARCHAR(100) NOT NULL,
        "last_name" VARCHAR(100) NOT NULL,
        "phone_number" VARCHAR(32),
        "golf_handicap" NUMERIC(4,1),
        "home_club" VARCHAR(150),
        "country" VARCHAR(2) NOT NULL DEFAULT 'US',
        "address_line1" VARCHAR(255),
        "address_line2" VARCHAR(255),
        "city" VARCHAR(100),
        "state_province" VARCHAR(100),
        "postal_code" VARCHAR(20),
        "avatar_url" TEXT,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    // refresh_tokens
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "refresh_tokens" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "token_hash" VARCHAR(255) NOT NULL UNIQUE,
        "family_id" UUID NOT NULL,
        "is_revoked" BOOLEAN NOT NULL DEFAULT false,
        "expires_at" TIMESTAMPTZ NOT NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS "idx_refresh_tokens_user_id" ON "refresh_tokens"("user_id");
      CREATE INDEX IF NOT EXISTS "idx_refresh_tokens_family_id" ON "refresh_tokens"("family_id");
    `);

    // audit_logs
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "audit_logs" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "actor_user_id" UUID REFERENCES "users"("id") ON DELETE SET NULL,
        "action" VARCHAR(100) NOT NULL,
        "entity_type" VARCHAR(100) NOT NULL,
        "entity_id" VARCHAR(255) NOT NULL,
        "details" JSONB NOT NULL,
        "ip_address" VARCHAR(45),
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS "idx_audit_logs_actor" ON "audit_logs"("actor_user_id");
      CREATE INDEX IF NOT EXISTS "idx_audit_logs_action" ON "audit_logs"("action");
      CREATE INDEX IF NOT EXISTS "idx_audit_logs_entity" ON "audit_logs"("entity_type", "entity_id");
    `);

    // subscription_plans
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "subscription_plans" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "stripe_price_id" VARCHAR(255) NOT NULL UNIQUE,
        "stripe_product_id" VARCHAR(255) NOT NULL,
        "name" VARCHAR(100) NOT NULL,
        "slug" VARCHAR(50) NOT NULL UNIQUE,
        "interval" "plan_interval_enum" NOT NULL DEFAULT 'MONTH',
        "amount_cents" BIGINT NOT NULL CHECK ("amount_cents" > 0),
        "currency" VARCHAR(3) NOT NULL DEFAULT 'USD',
        "entries_per_draw" INTEGER NOT NULL DEFAULT 1,
        "is_active" BOOLEAN NOT NULL DEFAULT true,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    // subscriptions
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "subscriptions" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE RESTRICT,
        "plan_id" UUID NOT NULL REFERENCES "subscription_plans"("id") ON DELETE RESTRICT,
        "stripe_subscription_id" VARCHAR(255) NOT NULL UNIQUE,
        "status" "subscription_status_enum" NOT NULL DEFAULT 'TRIALING',
        "current_period_start" TIMESTAMPTZ NOT NULL,
        "current_period_end" TIMESTAMPTZ NOT NULL,
        "cancel_at_period_end" BOOLEAN NOT NULL DEFAULT false,
        "canceled_at" TIMESTAMPTZ,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS "idx_subscriptions_user" ON "subscriptions"("user_id");
      CREATE INDEX IF NOT EXISTS "idx_subscriptions_plan" ON "subscriptions"("plan_id");
      CREATE INDEX IF NOT EXISTS "idx_subscriptions_period_end" ON "subscriptions"("current_period_end");
    `);

    // payments
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "payments" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE RESTRICT,
        "subscription_id" UUID REFERENCES "subscriptions"("id") ON DELETE RESTRICT,
        "stripe_payment_intent_id" VARCHAR(255) UNIQUE,
        "stripe_invoice_id" VARCHAR(255) UNIQUE,
        "amount_cents" BIGINT NOT NULL,
        "fee_cents" BIGINT NOT NULL DEFAULT 0,
        "net_cents" BIGINT NOT NULL,
        "currency" VARCHAR(3) NOT NULL DEFAULT 'USD',
        "status" "payment_status_enum" NOT NULL DEFAULT 'PENDING',
        "payment_method_type" VARCHAR(50) NOT NULL DEFAULT 'card',
        "receipt_url" TEXT,
        "idempotency_key" VARCHAR(255) NOT NULL UNIQUE,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS "idx_payments_user" ON "payments"("user_id");
      CREATE INDEX IF NOT EXISTS "idx_payments_sub" ON "payments"("subscription_id");
    `);

    // golf_scores
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "golf_scores" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE RESTRICT,
        "score_value" INTEGER NOT NULL CHECK ("score_value" >= 1 AND "score_value" <= 45),
        "played_at" DATE NOT NULL,
        "course_name" VARCHAR(150) NOT NULL,
        "holes_played" INTEGER NOT NULL DEFAULT 18 CHECK ("holes_played" IN (9, 18)),
        "is_active" BOOLEAN NOT NULL DEFAULT true,
        "archived_at" TIMESTAMPTZ,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS "idx_golf_scores_user_active" ON "golf_scores"("user_id", "is_active", "played_at" DESC);
    `);

    // charities
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "charities" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "name" VARCHAR(200) NOT NULL,
        "slug" VARCHAR(220) NOT NULL UNIQUE,
        "registration_number" VARCHAR(100) NOT NULL UNIQUE,
        "description" TEXT NOT NULL,
        "category" VARCHAR(100) NOT NULL,
        "logo_url" TEXT,
        "website_url" TEXT,
        "is_featured" BOOLEAN NOT NULL DEFAULT false,
        "is_verified" BOOLEAN NOT NULL DEFAULT true,
        "total_received_cents" BIGINT NOT NULL DEFAULT 0,
        "currency" VARCHAR(3) NOT NULL DEFAULT 'USD',
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS "idx_charities_cat_feat" ON "charities"("category", "is_featured");
    `);

    // user_charity_preferences
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "user_charity_preferences" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "charity_id" UUID NOT NULL REFERENCES "charities"("id") ON DELETE RESTRICT,
        "percentage" NUMERIC(5,2) NOT NULL DEFAULT 10.00 CHECK ("percentage" >= 10.00 AND "percentage" <= 100.00),
        "is_primary" BOOLEAN NOT NULL DEFAULT true,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT "uq_user_charity_pref" UNIQUE ("user_id", "charity_id")
      );
      CREATE INDEX IF NOT EXISTS "idx_user_charity_pref_user" ON "user_charity_preferences"("user_id");
    `);

    // charity_donations
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "charity_donations" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "charity_id" UUID NOT NULL REFERENCES "charities"("id") ON DELETE RESTRICT,
        "user_id" UUID REFERENCES "users"("id") ON DELETE SET NULL,
        "payment_id" UUID REFERENCES "payments"("id") ON DELETE RESTRICT,
        "amount_cents" BIGINT NOT NULL CHECK ("amount_cents" > 0),
        "currency" VARCHAR(3) NOT NULL DEFAULT 'USD',
        "source_type" VARCHAR(32) NOT NULL DEFAULT 'SUBSCRIPTION_PERCENTAGE',
        "status" VARCHAR(32) NOT NULL DEFAULT 'ACCRUED',
        "disbursed_at" TIMESTAMPTZ,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS "idx_charity_donations_charity" ON "charity_donations"("charity_id");
    `);

    // draw_configurations
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "draw_configurations" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "name" VARCHAR(100) NOT NULL,
        "draw_mode" "draw_mode_enum" NOT NULL DEFAULT 'RANDOM',
        "min_number" INTEGER NOT NULL DEFAULT 1,
        "max_number" INTEGER NOT NULL DEFAULT 45,
        "numbers_drawn_count" INTEGER NOT NULL DEFAULT 5,
        "prize_distribution_5_match" NUMERIC(5,2) NOT NULL DEFAULT 40.00,
        "prize_distribution_4_match" NUMERIC(5,2) NOT NULL DEFAULT 35.00,
        "prize_distribution_3_match" NUMERIC(5,2) NOT NULL DEFAULT 25.00,
        "rollover_unclaimed" BOOLEAN NOT NULL DEFAULT true,
        "is_active" BOOLEAN NOT NULL DEFAULT true,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    // draws
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "draws" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "draw_configuration_id" UUID NOT NULL REFERENCES "draw_configurations"("id") ON DELETE RESTRICT,
        "draw_number" INTEGER NOT NULL UNIQUE,
        "name" VARCHAR(150) NOT NULL,
        "scheduled_at" TIMESTAMPTZ NOT NULL,
        "executed_at" TIMESTAMPTZ,
        "status" "draw_status_enum" NOT NULL DEFAULT 'SCHEDULED',
        "total_entries_count" INTEGER NOT NULL DEFAULT 0,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS "idx_draws_status" ON "draws"("status", "scheduled_at");
    `);

    // draw_results
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "draw_results" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "draw_id" UUID NOT NULL UNIQUE REFERENCES "draws"("id") ON DELETE RESTRICT,
        "winning_numbers" INTEGER[] NOT NULL,
        "draw_seed_hash" VARCHAR(255) NOT NULL,
        "algorithm_mode" VARCHAR(32) NOT NULL,
        "published_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    // draw_entries
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "draw_entries" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "draw_id" UUID NOT NULL REFERENCES "draws"("id") ON DELETE RESTRICT,
        "user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE RESTRICT,
        "subscription_id" UUID NOT NULL REFERENCES "subscriptions"("id") ON DELETE RESTRICT,
        "selected_numbers" INTEGER[] NOT NULL,
        "matched_numbers" INTEGER[],
        "match_count" INTEGER NOT NULL DEFAULT 0,
        "is_winner" BOOLEAN NOT NULL DEFAULT false,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS "idx_draw_entries_draw_user" ON "draw_entries"("draw_id", "user_id");
      CREATE INDEX IF NOT EXISTS "idx_draw_entries_matches" ON "draw_entries"("draw_id", "match_count" DESC);
    `);

    // draw_simulations
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "draw_simulations" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "draw_configuration_id" UUID NOT NULL REFERENCES "draw_configurations"("id") ON DELETE RESTRICT,
        "name" VARCHAR(150) NOT NULL,
        "simulated_by_user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE RESTRICT,
        "simulated_entry_count" INTEGER NOT NULL,
        "winning_numbers" INTEGER[] NOT NULL,
        "simulation_stats" JSONB NOT NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    // prize_pools
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "prize_pools" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "draw_id" UUID NOT NULL UNIQUE REFERENCES "draws"("id") ON DELETE RESTRICT,
        "total_pool_cents" BIGINT NOT NULL,
        "rollover_in_cents" BIGINT NOT NULL DEFAULT 0,
        "rollover_out_cents" BIGINT NOT NULL DEFAULT 0,
        "currency" VARCHAR(3) NOT NULL DEFAULT 'USD',
        "is_finalized" BOOLEAN NOT NULL DEFAULT false,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    // prize_tiers
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "prize_tiers" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "prize_pool_id" UUID NOT NULL REFERENCES "prize_pools"("id") ON DELETE CASCADE,
        "match_count" INTEGER NOT NULL CHECK ("match_count" IN (3, 4, 5)),
        "allocated_percentage" NUMERIC(5,2) NOT NULL,
        "allocated_cents" BIGINT NOT NULL,
        "winner_count" INTEGER NOT NULL DEFAULT 0,
        "payout_per_winner_cents" BIGINT NOT NULL DEFAULT 0,
        "rollover_cents" BIGINT NOT NULL DEFAULT 0,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT "uq_pool_match" UNIQUE ("prize_pool_id", "match_count")
      );
    `);

    // winners
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "winners" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "draw_id" UUID NOT NULL REFERENCES "draws"("id") ON DELETE RESTRICT,
        "draw_entry_id" UUID NOT NULL UNIQUE REFERENCES "draw_entries"("id") ON DELETE RESTRICT,
        "prize_tier_id" UUID NOT NULL REFERENCES "prize_tiers"("id") ON DELETE RESTRICT,
        "user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE RESTRICT,
        "prize_amount_cents" BIGINT NOT NULL,
        "currency" VARCHAR(3) NOT NULL DEFAULT 'USD',
        "verification_status" "verification_status_enum" NOT NULL DEFAULT 'PENDING',
        "verified_by_user_id" UUID REFERENCES "users"("id") ON DELETE RESTRICT,
        "verified_at" TIMESTAMPTZ,
        "rejection_reason" TEXT,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS "idx_winners_draw" ON "winners"("draw_id");
      CREATE INDEX IF NOT EXISTS "idx_winners_user_status" ON "winners"("user_id", "verification_status");
    `);

    // winner_proofs
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "winner_proofs" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "winner_id" UUID NOT NULL REFERENCES "winners"("id") ON DELETE CASCADE,
        "file_url" TEXT NOT NULL,
        "file_type" VARCHAR(50) NOT NULL,
        "file_size_bytes" BIGINT NOT NULL,
        "submitted_notes" TEXT,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS "idx_winner_proofs_winner" ON "winner_proofs"("winner_id");
    `);

    // payouts
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "payouts" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "winner_id" UUID NOT NULL UNIQUE REFERENCES "winners"("id") ON DELETE RESTRICT,
        "user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE RESTRICT,
        "amount_cents" BIGINT NOT NULL,
        "currency" VARCHAR(3) NOT NULL DEFAULT 'USD',
        "payout_method" VARCHAR(50) NOT NULL DEFAULT 'STRIPE_CONNECT',
        "payout_reference" VARCHAR(255) UNIQUE,
        "status" "payout_status_enum" NOT NULL DEFAULT 'PENDING',
        "failure_reason" TEXT,
        "processed_at" TIMESTAMPTZ,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS "idx_payouts_status" ON "payouts"("status");
    `);

    // notifications
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "notifications" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "title" VARCHAR(255) NOT NULL,
        "message" TEXT NOT NULL,
        "type" VARCHAR(50) NOT NULL DEFAULT 'GENERAL',
        "is_read" BOOLEAN NOT NULL DEFAULT false,
        "metadata" JSONB,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS "idx_notifications_user_read" ON "notifications"("user_id", "is_read", "created_at" DESC);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "notifications" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "payouts" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "winner_proofs" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "winners" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "prize_tiers" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "prize_pools" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "draw_simulations" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "draw_entries" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "draw_results" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "draws" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "draw_configurations" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "charity_donations" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "user_charity_preferences" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "charities" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "golf_scores" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "payments" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "subscriptions" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "subscription_plans" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "audit_logs" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "refresh_tokens" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "user_profiles" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "users" CASCADE;`);

    await queryRunner.query(`DROP TYPE IF EXISTS "payout_status_enum";`);
    await queryRunner.query(`DROP TYPE IF EXISTS "verification_status_enum";`);
    await queryRunner.query(`DROP TYPE IF EXISTS "draw_mode_enum";`);
    await queryRunner.query(`DROP TYPE IF EXISTS "draw_status_enum";`);
    await queryRunner.query(`DROP TYPE IF EXISTS "payment_status_enum";`);
    await queryRunner.query(`DROP TYPE IF EXISTS "subscription_status_enum";`);
    await queryRunner.query(`DROP TYPE IF EXISTS "plan_interval_enum";`);
    await queryRunner.query(`DROP TYPE IF EXISTS "user_status_enum";`);
    await queryRunner.query(`DROP TYPE IF EXISTS "user_role_enum";`);
  }
}
