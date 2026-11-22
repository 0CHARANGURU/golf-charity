import crypto from 'crypto';
import { AppDataSource } from '../database/dataSource';
import { Payout, Winner, Notification } from '../entities';
import { PayoutStatus, VerificationStatus } from '../constants';

export class PayoutService {
  private payoutRepo = AppDataSource.getRepository(Payout);
  private winnerRepo = AppDataSource.getRepository(Winner);
  private notifRepo = AppDataSource.getRepository(Notification);

  async processPayout(
    adminUserId: string,
    winnerId: string,
    payoutMethod = 'STRIPE_CONNECT'
  ): Promise<Payout> {
    return AppDataSource.transaction(async (manager) => {
      const winner = await manager.findOne(Winner, {
        where: { id: winnerId },
        relations: ['payout', 'user', 'draw'],
      });

      if (!winner) {
        throw new Error('Winner record not found.');
      }

      if (winner.verificationStatus !== VerificationStatus.APPROVED) {
        throw new Error('Cannot disburse payout: winner score proof has not been APPROVED.');
      }

      if (winner.payout && (winner.payout.status === PayoutStatus.PAID || winner.payout.status === PayoutStatus.PROCESSING)) {
        throw new Error('Payout has already been initiated or paid for this winner.');
      }

      const payoutRef = `PAYOUT-${Date.now()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

      let payout = winner.payout;
      if (!payout) {
        payout = manager.create(Payout, {
          winnerId: winner.id,
          userId: winner.userId,
          amountCents: winner.prizeAmountCents,
          currency: winner.currency,
          payoutMethod,
          payoutReference: payoutRef,
          status: PayoutStatus.PAID,
          processedAt: new Date(),
        });
      } else {
        payout.status = PayoutStatus.PAID;
        payout.processedAt = new Date();
        payout.payoutReference = payoutRef;
        payout.payoutMethod = payoutMethod;
      }

      const savedPayout = await manager.save(payout);

      // In-app notification
      await manager.save(
        manager.create(Notification, {
          userId: winner.userId,
          title: 'Payout Disbursed!',
          message: `Your prize payout of $${(winner.prizeAmountCents / 100).toFixed(2)} for Draw #${winner.draw.drawNumber} has been successfully disbursed via ${payoutMethod}. Reference: ${payoutRef}`,
          type: 'PAYOUT_SENT',
          metadata: { payoutId: savedPayout.id, payoutReference: payoutRef },
        })
      );

      return savedPayout;
    });
  }

  async getMyPayouts(userId: string): Promise<Payout[]> {
    return this.payoutRepo.find({
      where: { userId },
      relations: ['winner', 'winner.draw'],
      order: { createdAt: 'DESC' },
    });
  }

  async getAdminPayouts(status?: PayoutStatus): Promise<Payout[]> {
    const where: any = {};
    if (status) {
      where.status = status;
    }
    return this.payoutRepo.find({
      where,
      relations: ['winner', 'winner.draw', 'user', 'user.profile'],
      order: { createdAt: 'DESC' },
    });
  }
}
