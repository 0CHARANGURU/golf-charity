import 'reflect-metadata';
import { AppDataSource } from '../src/database/dataSource';
import { runSeeds } from '../src/database/seeds/seed';
import {
  User,
  UserProfile,
  SubscriptionPlan,
  Charity,
  DrawConfiguration,
  GolfScore,
} from '../src/entities';

async function verifyPhase3() {
  console.log('--- Phase 3 Verification: Database, Migrations & Seeds ---');
  await AppDataSource.initialize();

  // 1. Run Migrations
  console.log('Running pending migrations...');
  const executedMigrations = await AppDataSource.runMigrations();
  console.log(`Executed ${executedMigrations.length} migration(s):`, executedMigrations.map((m) => m.name));

  // 2. Verify all 22 tables exist in PostgreSQL
  const expectedTables = [
    'users',
    'user_profiles',
    'refresh_tokens',
    'audit_logs',
    'subscription_plans',
    'subscriptions',
    'payments',
    'golf_scores',
    'charities',
    'user_charity_preferences',
    'charity_donations',
    'draw_configurations',
    'draws',
    'draw_results',
    'draw_entries',
    'draw_simulations',
    'prize_pools',
    'prize_tiers',
    'winners',
    'winner_proofs',
    'payouts',
    'notifications',
  ];

  const dbTablesResult: Array<{ table_name: string }> = await AppDataSource.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
  `);
  const existingTableNames = new Set(dbTablesResult.map((r) => r.table_name));

  const missingTables = expectedTables.filter((t) => !existingTableNames.has(t));
  if (missingTables.length > 0) {
    throw new Error(`Missing expected database tables: ${missingTables.join(', ')}`);
  }
  console.log(`All ${expectedTables.length} tables confirmed present in PostgreSQL!`);

  // 3. Run Seeds
  await runSeeds();

  // 4. Verify Seeded Records
  const plans = await AppDataSource.getRepository(SubscriptionPlan).find();
  console.log(`Verified Subscription Plans count: ${plans.length}`);

  const charities = await AppDataSource.getRepository(Charity).find();
  console.log(`Verified Charities count: ${charities.length}`);

  const admin = await AppDataSource.getRepository(User).findOne({
    where: { email: 'admin@golfcharity.com' },
    relations: ['profile'],
  });
  if (!admin || admin.role !== 'ADMIN') {
    throw new Error('Admin user seed verification failed');
  }
  console.log(`Verified Admin User: ${admin.email} (Role: ${admin.role})`);

  const drawConfig = await AppDataSource.getRepository(DrawConfiguration).findOne({
    where: { name: 'Official Monthly Championship Draw' },
  });
  if (!drawConfig || drawConfig.numbersDrawnCount !== 5) {
    throw new Error('Draw configuration seed verification failed');
  }
  console.log(`Verified Draw Configuration: ${drawConfig.name} (Range: ${drawConfig.minNumber}-${drawConfig.maxNumber})`);

  // 5. Test Check Constraint: score_value must be 1-45
  console.log('Testing score range check constraint (score 50 should be rejected)...');
  const scoreRepo = AppDataSource.getRepository(GolfScore);
  let checkConstraintPassed = false;
  try {
    const invalidScore = scoreRepo.create({
      userId: admin.id,
      scoreValue: 50, // Invalid! Range is 1-45
      playedAt: '2026-11-20',
      courseName: 'Test Course',
      holesPlayed: 18,
    });
    await scoreRepo.save(invalidScore);
  } catch (err: any) {
    if (err.message.includes('check constraint') || err.message.includes('violates check constraint')) {
      checkConstraintPassed = true;
      console.log('Check constraint successfully rejected invalid score 50 (1-45 range enforced).');
    } else {
      throw err;
    }
  }

  if (!checkConstraintPassed) {
    throw new Error('Check constraint for score 1-45 was NOT enforced by PostgreSQL!');
  }

  await AppDataSource.destroy();
  console.log('--- Phase 3 Successfully Verified! ---');
}

verifyPhase3()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Phase 3 verification failed:', err);
    process.exit(1);
  });
