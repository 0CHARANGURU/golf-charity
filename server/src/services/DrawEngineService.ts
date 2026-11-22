import crypto from 'crypto';
import { AppDataSource } from '../database/dataSource';
import {
  Draw,
  DrawConfiguration,
  DrawResult,
  DrawEntry,
  PrizePool,
  PrizeTier,
  Winner,
  DrawSimulation,
  Notification,
  GolfScore,
} from '../entities';
import { DrawStatus, DrawMode, VerificationStatus } from '../constants';
import { generateCsprngNumbers, generateFrequencyWeightedNumbers } from '../utils/cryptoRng';

export class DrawEngineService {
  private drawRepo = AppDataSource.getRepository(Draw);
  private configRepo = AppDataSource.getRepository(DrawConfiguration);
  private entryRepo = AppDataSource.getRepository(DrawEntry);
  private poolRepo = AppDataSource.getRepository(PrizePool);
  private tierRepo = AppDataSource.getRepository(PrizeTier);
  private winnerRepo = AppDataSource.getRepository(Winner);
  private simRepo = AppDataSource.getRepository(DrawSimulation);
  private notifRepo = AppDataSource.getRepository(Notification);
  private scoreRepo = AppDataSource.getRepository(GolfScore);

  /**
   * Generates a 5-number draw ticket for a subscriber based on their active golf scores.
   * Strategy: Take user's active scores (sorted). If duplicate or fewer than 5 exist,
   * deterministically deduplicate and fill using modulo offset.
   */
  generateDrawNumbersFromScores(scores: number[]): number[] {
    const unique = Array.from(new Set(scores.filter((s) => s >= 1 && s <= 45))).sort((a, b) => a - b);
    let offset = 1;
    while (unique.length < 5) {
      const candidate = ((unique[0] || 1) + offset * 7) % 45 + 1;
      if (!unique.includes(candidate)) {
        unique.push(candidate);
      }
      offset++;
    }
    return unique.slice(0, 5).sort((a, b) => a - b);
  }

  /**
   * Executes an official scheduled draw within a strict database transaction.
   */
  async executeDraw(drawId: string): Promise<Draw> {
    return AppDataSource.transaction(async (manager) => {
      const draw = await manager.findOne(Draw, {
        where: { id: drawId },
        relations: ['configuration', 'prizePool', 'prizePool.tiers'],
      });

      if (!draw) {
        throw new Error('Draw not found.');
      }

      if (draw.status !== DrawStatus.SCHEDULED) {
        throw new Error(`Cannot execute draw with status ${draw.status}.`);
      }

      draw.status = DrawStatus.EXECUTING;
      await manager.save(draw);

      const config = draw.configuration;

      // 1. Generate Winning Numbers (CSPRNG)
      let winningNumbers: number[];
      if (config.drawMode === DrawMode.FREQUENCY_WEIGHTED) {
        // Compute frequencies from active scores across platform
        const scoreCounts = await manager
          .createQueryBuilder(GolfScore, 's')
          .select('s.scoreValue', 'score')
          .addSelect('COUNT(*)', 'count')
          .where('s.isActive = true')
          .groupBy('s.scoreValue')
          .getRawMany();

        const weights = new Map<number, number>();
        for (const row of scoreCounts) {
          weights.set(parseInt(row.score, 10), parseInt(row.count, 10));
        }
        winningNumbers = generateFrequencyWeightedNumbers(weights, config.numbersDrawnCount, config.minNumber, config.maxNumber);
      } else {
        winningNumbers = generateCsprngNumbers(config.numbersDrawnCount, config.minNumber, config.maxNumber);
      }

      const seedHash = crypto.createHash('sha256').update(`${draw.id}:${winningNumbers.join(',')}:${Date.now()}`).digest('hex');

      // 2. Save Draw Result
      const result = manager.create(DrawResult, {
        drawId: draw.id,
        winningNumbers,
        drawSeedHash: seedHash,
        algorithmMode: config.drawMode,
      });
      await manager.save(result);

      // 3. Score all Draw Entries
      const entries = await manager.find(DrawEntry, { where: { drawId: draw.id } });
      const winnersByTier: { [matchCount: number]: DrawEntry[] } = { 3: [], 4: [], 5: [] };

      for (const entry of entries) {
        const matches = entry.selectedNumbers.filter((n) => winningNumbers.includes(n));
        entry.matchedNumbers = matches;
        entry.matchCount = matches.length;
        entry.isWinner = matches.length >= 3;
        await manager.save(entry);

        if (matches.length >= 3 && matches.length <= 5) {
          winnersByTier[matches.length].push(entry);
        }
      }

      // 4. Calculate Prize Pool Allocations & Tiers
      let pool = draw.prizePool;
      if (!pool) {
        pool = manager.create(PrizePool, {
          drawId: draw.id,
          draw,
          totalPoolCents: 100000, // Default $1,000 baseline if not pre-seeded
          rolloverInCents: 0,
          rolloverOutCents: 0,
          currency: 'USD',
          isFinalized: false,
        });
        await manager.save(pool);
        draw.prizePool = pool;
      }

      const tierPercentages: { [match: number]: number } = {
        5: config.prizeDistribution5Match || 40.0,
        4: config.prizeDistribution4Match || 35.0,
        3: config.prizeDistribution3Match || 25.0,
      };

      let totalRolloverOutCents = 0;

      for (const matchCount of [5, 4, 3]) {
        const pct = tierPercentages[matchCount];
        const allocatedCents = Math.floor((pool.totalPoolCents * pct) / 100);
        const winningEntries = winnersByTier[matchCount] || [];
        const winnerCount = winningEntries.length;

        let payoutPerWinner = 0;
        let rolloverCents = 0;

        if (winnerCount > 0) {
          payoutPerWinner = Math.floor(allocatedCents / winnerCount);
          // Remainder cents stay in pool rollover
          rolloverCents = allocatedCents - payoutPerWinner * winnerCount;
        } else {
          // Zero winners: 100% of tier funds roll over!
          rolloverCents = allocatedCents;
          totalRolloverOutCents += rolloverCents;
        }

        let tier = await manager.findOne(PrizeTier, {
          where: { prizePoolId: pool.id, matchCount },
        });

        if (!tier) {
          tier = manager.create(PrizeTier, {
            prizePoolId: pool.id,
            matchCount,
            allocatedPercentage: pct,
            allocatedCents,
            winnerCount,
            payoutPerWinnerCents: payoutPerWinner,
            rolloverCents,
          });
        } else {
          tier.allocatedPercentage = pct;
          tier.allocatedCents = allocatedCents;
          tier.winnerCount = winnerCount;
          tier.payoutPerWinnerCents = payoutPerWinner;
          tier.rolloverCents = rolloverCents;
        }
        await manager.save(tier);

        // Record Winners & Send Notifications
        for (const entry of winningEntries) {
          const winner = manager.create(Winner, {
            drawId: draw.id,
            drawEntryId: entry.id,
            prizeTierId: tier.id,
            userId: entry.userId,
            prizeAmountCents: payoutPerWinner,
            currency: 'USD',
            verificationStatus: VerificationStatus.PENDING,
          });
          await manager.save(winner);

          // Dispatch in-app notification
          const notif = manager.create(Notification, {
            userId: entry.userId,
            title: `You matched ${matchCount} numbers in Draw #${draw.drawNumber}!`,
            message: `Congratulations! Your ticket matched ${matchCount} numbers for a prize of $${(payoutPerWinner / 100).toFixed(2)}. Please upload your scorecard proof in the winnings dashboard.`,
            type: 'WINNER_ALERT',
            metadata: { drawId: draw.id, winnerId: winner.id, prizeAmountCents: payoutPerWinner },
          });
          await manager.save(notif);
        }
      }

      pool.drawId = draw.id;
      pool.draw = draw;
      pool.rolloverOutCents = totalRolloverOutCents;
      pool.isFinalized = true;
      await manager.save(pool);

      draw.status = DrawStatus.PUBLISHED;
      draw.executedAt = new Date();
      draw.totalEntriesCount = entries.length;
      await manager.save(draw);

      return draw;
    });
  }

  /**
   * Administrative Simulation Sandbox.
   * NEVER modifies official tables. Results recorded strictly in `DrawSimulation`.
   */
  async runSimulation(
    configurationId: string,
    simulatedByUserId: string,
    entryCount: number,
    mode: DrawMode = DrawMode.RANDOM
  ): Promise<DrawSimulation> {
    const config = await this.configRepo.findOne({ where: { id: configurationId } });
    if (!config) {
      throw new Error('Draw configuration not found.');
    }

    // 1. Generate winning numbers
    const winningNumbers = generateCsprngNumbers(config.numbersDrawnCount, config.minNumber, config.maxNumber);

    // 2. Generate mock entries and compute matches in memory
    const stats: { [matchCount: number]: number } = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

    for (let i = 0; i < entryCount; i++) {
      const ticket = generateCsprngNumbers(5, 1, 45);
      const matches = ticket.filter((n) => winningNumbers.includes(n)).length;
      stats[matches] = (stats[matches] || 0) + 1;
    }

    const theoreticalPoolCents = entryCount * 1000; // Simulated $10/entry
    const match5Payout = stats[5] > 0 ? Math.floor((theoreticalPoolCents * 0.4) / stats[5]) : 0;
    const match4Payout = stats[4] > 0 ? Math.floor((theoreticalPoolCents * 0.35) / stats[4]) : 0;
    const match3Payout = stats[3] > 0 ? Math.floor((theoreticalPoolCents * 0.25) / stats[3]) : 0;

    const sim = this.simRepo.create({
      drawConfigurationId: config.id,
      name: `Simulation - ${entryCount} tickets (${mode})`,
      simulatedByUserId,
      simulatedEntryCount: entryCount,
      winningNumbers,
      simulationStats: {
        mode,
        matchCounts: stats,
        theoreticalPoolCents,
        payoutEstimates: {
          match5PerWinnerCents: match5Payout,
          match4PerWinnerCents: match4Payout,
          match3PerWinnerCents: match3Payout,
        },
      },
    });

    return this.simRepo.save(sim);
  }
}
