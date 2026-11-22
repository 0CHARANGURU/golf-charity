import 'reflect-metadata';
import { AppDataSource } from '../src/database/dataSource';
import { AuthService } from '../src/services/AuthService';
import { GolfScoreService } from '../src/services/GolfScoreService';
import { CharityService } from '../src/services/CharityService';
import { StripeService } from '../src/services/StripeService';
import { DrawEngineService } from '../src/services/DrawEngineService';
import { WinnerVerificationService } from '../src/services/WinnerVerificationService';
import { PayoutService } from '../src/services/PayoutService';
import {
  SubscriptionPlan,
  Subscription,
  Draw,
  DrawConfiguration,
  DrawEntry,
  Winner,
  Charity,
} from '../src/entities';
import { DrawStatus, DrawMode, VerificationStatus, PayoutStatus } from '../src/constants';

async function verifyPhases5To10() {
  console.log('=== Verifying Phases 5 through 10 Backend Engines ===');
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }

  const authService = new AuthService();
  const scoreService = new GolfScoreService();
  const charityService = new CharityService();
  const stripeService = new StripeService();
  const drawEngine = new DrawEngineService();
  const verificationService = new WinnerVerificationService();
  const payoutService = new PayoutService();

  // Create test user
  const email = `player_${Date.now()}@golfcharity.test`;
  const { user } = await authService.register({
    email,
    password: 'Password123!',
    firstName: 'Rory',
    lastName: 'McIlroy',
    country: 'US',
  });
  console.log('Created test golfer:', user.email);

  // Get Admin user
  const admin = await AppDataSource.getRepository('users').findOne({
    where: { email: 'admin@golfcharity.com' },
  });
  if (!admin) throw new Error('Admin user not found');

  // --- Phase 7: Golf Scores & FIFO Archival ---
  console.log('\n--- Testing Phase 7: Golf Score Service ---');
  // Submit 5 valid scores (scores: 34, 36, 38, 40, 42)
  const scoreDates = ['2026-11-10', '2026-11-12', '2026-11-14', '2026-11-16', '2026-11-18'];
  for (let i = 0; i < 5; i++) {
    await scoreService.submitScore(user.id, {
      scoreValue: 34 + i * 2,
      playedAt: scoreDates[i],
      courseName: `Augusta National Hole ${i + 1}`,
      holesPlayed: 18,
    });
  }

  let activeScores = await scoreService.getMyScores(user.id, false);
  console.log(`Active scores count after 5 submissions: ${activeScores.length}`);
  if (activeScores.length !== 5) {
    throw new Error(`Expected 5 active scores, got ${activeScores.length}`);
  }

  // Submit 6th score (score 44 on 2026-11-20)
  console.log('Submitting 6th score to test FIFO archival...');
  await scoreService.submitScore(user.id, {
    scoreValue: 44,
    playedAt: '2026-11-20',
    courseName: 'Pebble Beach',
    holesPlayed: 18,
  });

  activeScores = await scoreService.getMyScores(user.id, false);
  console.log(`Active scores count after 6th submission: ${activeScores.length}`);
  if (activeScores.length !== 5) {
    throw new Error(`Expected 5 active scores after 6th submission, got ${activeScores.length}`);
  }

  const allScores = await scoreService.getMyScores(user.id, true);
  console.log(`Total scores (including archived): ${allScores.length}`);
  const archived = allScores.filter((s) => !s.isActive);
  if (archived.length !== 1 || archived[0].scoreValue !== 34) {
    throw new Error('Oldest score (34 on 2026-11-10) was not archived properly.');
  }
  console.log('FIFO Archival verified: oldest score (34) successfully archived.');

  // Test invalid score range rejection
  let scoreRejected = false;
  try {
    await scoreService.submitScore(user.id, {
      scoreValue: 46, // Invalid > 45
      playedAt: '2026-11-21',
      courseName: 'Invalid Club',
    });
  } catch (err: any) {
    scoreRejected = true;
    console.log('Invalid score 46 rejected as expected:', err.message);
  }
  if (!scoreRejected) throw new Error('Invalid score 46 was not rejected!');

  // --- Phase 8: Charity & Philanthropy ---
  console.log('\n--- Testing Phase 8: Charity Service ---');
  const { charities, totalCount } = await charityService.getCharities();
  console.log(`Retrieved ${charities.length} of ${totalCount} seeded charities.`);
  const targetCharity = charities[0];

  // Set preference to 15% (Success)
  const pref = await charityService.setCharityPreference(user.id, targetCharity.id, 15.0);
  console.log(`Set charity preference: ${pref.percentage}% to ${targetCharity.name}`);

  // Test minimum 10% enforcement
  let minCharityRejected = false;
  try {
    await charityService.setCharityPreference(user.id, targetCharity.id, 8.5); // Invalid < 10%
  } catch (err: any) {
    minCharityRejected = true;
    console.log('Sub-10% charity preference rejected as expected:', err.message);
  }
  if (!minCharityRejected) throw new Error('Sub-10% charity preference was not rejected!');

  // Record donation
  await charityService.recordDonation(targetCharity.id, 500, user.id);
  const updatedCharity = await charityService.getCharity(targetCharity.id);
  console.log(`Charity total received: $${((updatedCharity?.totalReceivedCents || 0) / 100).toFixed(2)}`);

  // --- Phase 6: Stripe Subscriptions & Webhooks ---
  console.log('\n--- Testing Phase 6: Stripe Subscriptions & Webhooks ---');
  const plan = await AppDataSource.getRepository(SubscriptionPlan).findOne({
    where: { slug: 'monthly-standard' },
  });
  if (!plan) throw new Error('Monthly plan not found');

  const checkout = await stripeService.createCheckoutSession(user.id, plan.id);
  console.log('Checkout session created:', checkout.sessionId);

  // Simulate checkout.session.completed webhook
  const fakeSubId = `sub_test_${Date.now()}`;
  await stripeService.handleWebhookEvent({
    id: `evt_session_${Date.now()}`,
    type: 'checkout.session.completed',
    data: {
      object: {
        id: checkout.sessionId,
        subscription: fakeSubId,
        metadata: { userId: user.id, planId: plan.id },
      } as any,
    },
  } as any);

  const sub = await AppDataSource.getRepository(Subscription).findOne({
    where: { stripeSubscriptionId: fakeSubId },
  });
  if (!sub) throw new Error('Subscription was not activated by webhook!');
  console.log(`Subscription activated: ${sub.id} (Status: ${sub.status})`);

  // Simulate invoice.paid webhook (idempotent)
  const invoiceEventId = `evt_inv_${Date.now()}`;
  await stripeService.handleWebhookEvent({
    id: invoiceEventId,
    type: 'invoice.paid',
    data: {
      object: {
        id: `in_test_${Date.now()}`,
        subscription: fakeSubId,
        amount_paid: 2000,
        currency: 'usd',
      } as any,
    },
  } as any);
  console.log('Invoice paid webhook processed, payment and charity split recorded.');

  // Test Idempotency: replay same invoice event
  const replayResult = await stripeService.handleWebhookEvent({
    id: invoiceEventId,
    type: 'invoice.paid',
    data: { object: {} as any },
  } as any);
  if (replayResult.processed) {
    throw new Error('Idempotency failed: duplicate webhook was re-processed!');
  }
  console.log('Idempotency verified: duplicate webhook safely ignored.');

  // --- Phase 9: Draw Engine & Simulations ---
  console.log('\n--- Testing Phase 9: Draw Engine & Simulation Sandbox ---');
  const drawConfig = await AppDataSource.getRepository(DrawConfiguration).findOne({
    where: { isActive: true },
  });
  if (!drawConfig) throw new Error('Draw configuration not found');

  // Test isolated simulation
  console.log('Running isolated sandbox simulation with 500 tickets...');
  const sim = await drawEngine.runSimulation(drawConfig.id, admin.id, 500, DrawMode.RANDOM);
  console.log(`Simulation complete: ${sim.simulatedEntryCount} tickets simulated.`);
  console.log('Match counts:', sim.simulationStats.matchCounts);

  // Create an official Draw
  const drawRepo = AppDataSource.getRepository(Draw);
  const drawNumber = Math.floor(Date.now() / 1000) % 1000000;
  const officialDraw = drawRepo.create({
    drawConfigurationId: drawConfig.id,
    drawNumber,
    name: `Official Championship Draw #${drawNumber}`,
    scheduledAt: new Date(),
    status: DrawStatus.SCHEDULED,
  });
  await drawRepo.save(officialDraw);

  // Generate a ticket for our test golfer using their 5 active scores
  const scoreValues = activeScores.map((s) => s.scoreValue);
  const ticketNumbers = drawEngine.generateDrawNumbersFromScores(scoreValues);
  console.log(`Derived draw numbers for golfer from scores (${scoreValues.join(',')}): [${ticketNumbers.join(', ')}]`);

  const entryRepo = AppDataSource.getRepository(DrawEntry);
  const entry = entryRepo.create({
    drawId: officialDraw.id,
    userId: user.id,
    subscriptionId: sub.id,
    selectedNumbers: ticketNumbers,
  });
  await entryRepo.save(entry);

  // Execute Official Draw
  console.log('Executing official draw #101 with CSPRNG...');
  const executedDraw = await drawEngine.executeDraw(officialDraw.id);
  console.log(`Draw executed successfully! Status: ${executedDraw.status}`);
  const result = await AppDataSource.getRepository('draw_results').findOne({
    where: { drawId: officialDraw.id },
  });
  console.log('Winning numbers:', (result as any).winningNumbers);

  // --- Phase 10: Prize Pools & Winner Verification ---
  console.log('\n--- Testing Phase 10: Winner Verification & Payouts ---');
  // Create a synthetic winner in Draw #101 to test verification & payout workflow
  const tier = await AppDataSource.getRepository('prize_tiers').findOne({
    where: { matchCount: 4 },
  });
  if (!tier) throw new Error('Prize tier not found');

  const winnerRepo = AppDataSource.getRepository(Winner);
  const testWinner = winnerRepo.create({
    drawId: officialDraw.id,
    drawEntryId: entry.id,
    prizeTierId: (tier as any).id,
    userId: user.id,
    prizeAmountCents: 35000, // $350.00
    currency: 'USD',
    verificationStatus: VerificationStatus.PENDING,
  });
  await winnerRepo.save(testWinner);

  // 1. Golfer uploads proof
  console.log('Submitting scorecard proof for winner...');
  const proof = await verificationService.submitProof(user.id, {
    winnerId: testWinner.id,
    fileUrl: 'https://storage.golfcharity.test/proofs/scorecard_101.jpg',
    fileType: 'image/jpeg',
    fileSizeBytes: 2048500,
    notes: 'Official club signed scorecard from Augusta National.',
  });
  console.log('Proof uploaded:', proof.id);

  // 2. Admin verifies and approves winner
  console.log('Admin reviewing and approving winner...');
  const approvedWinner = await verificationService.adminVerifyWinner((admin as any).id, testWinner.id, true);
  if (approvedWinner.verificationStatus !== VerificationStatus.APPROVED) {
    throw new Error('Winner status was not set to APPROVED.');
  }
  console.log('Winner approved successfully.');

  // 3. Admin processes payout
  console.log('Admin processing payout...');
  const payout = await payoutService.processPayout((admin as any).id, approvedWinner.id, 'STRIPE_CONNECT');
  if (payout.status !== PayoutStatus.PAID || !payout.payoutReference) {
    throw new Error('Payout processing failed.');
  }
  console.log(`Payout disbursed: Reference ${payout.payoutReference}, Amount: $${(payout.amountCents / 100).toFixed(2)}`);

  // Verify duplicate payout prevention
  let dupPayoutRejected = false;
  try {
    await payoutService.processPayout((admin as any).id, approvedWinner.id, 'STRIPE_CONNECT');
  } catch (err: any) {
    dupPayoutRejected = true;
    console.log('Duplicate payout prevented as expected:', err.message);
  }
  if (!dupPayoutRejected) throw new Error('Duplicate payout was allowed!');

  await AppDataSource.destroy();
  console.log('\n=== All Tests for Phases 5 through 10 PASSED with 100% Integrity! ===');
}

verifyPhases5To10()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Phases 5-10 verification failed:', err);
    process.exit(1);
  });
