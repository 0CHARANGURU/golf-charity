import { AppDataSource } from '../../../database/dataSource';
import {
  Subscription,
  CharityDonation,
  Payout,
  GolfScore,
  Draw,
  Winner,
  AuditLog,
} from '../../../entities';
import { UserRole, SubscriptionStatus, DrawStatus, VerificationStatus, PayoutStatus } from '../../../constants';
import { GraphQLContext, requireRole } from '../../context';

export const analyticsResolvers = {
  Query: {
    adminAnalytics: async (_: any, __: any, context: GraphQLContext) => {
      requireRole(context, [UserRole.ADMIN]);

      const subRepo = AppDataSource.getRepository(Subscription);
      const donationRepo = AppDataSource.getRepository(CharityDonation);
      const payoutRepo = AppDataSource.getRepository(Payout);
      const scoreRepo = AppDataSource.getRepository(GolfScore);
      const drawRepo = AppDataSource.getRepository(Draw);
      const winnerRepo = AppDataSource.getRepository(Winner);

      const totalSubscribers = await subRepo.count({
        where: { status: SubscriptionStatus.ACTIVE },
      });

      // Sum MRR from active subscriptions
      const mrrResult = await subRepo
        .createQueryBuilder('s')
        .innerJoin('s.plan', 'p')
        .select('SUM(p.amountCents)', 'mrr')
        .where('s.status = :status', { status: SubscriptionStatus.ACTIVE })
        .getRawOne();

      const totalCharityResult = await donationRepo
        .createQueryBuilder('d')
        .select('SUM(d.amountCents)', 'total')
        .getRawOne();

      const totalPrizesResult = await payoutRepo
        .createQueryBuilder('p')
        .select('SUM(p.amountCents)', 'total')
        .where('p.status = :status', { status: PayoutStatus.PAID })
        .getRawOne();

      const totalActiveScores = await scoreRepo.count({ where: { isActive: true } });
      const upcomingDrawCount = await drawRepo.count({ where: { status: DrawStatus.SCHEDULED } });
      const pendingVerificationsCount = await winnerRepo.count({
        where: { verificationStatus: VerificationStatus.PENDING },
      });

      return {
        totalSubscribers,
        monthlyRecurringRevenueCents: mrrResult?.mrr ? parseInt(mrrResult.mrr, 10) : 0,
        totalCharityRaisedCents: totalCharityResult?.total ? parseInt(totalCharityResult.total, 10) : 0,
        totalPrizesDisbursedCents: totalPrizesResult?.total ? parseInt(totalPrizesResult.total, 10) : 0,
        totalActiveScores,
        upcomingDrawCount,
        pendingVerificationsCount,
      };
    },
    adminAuditLogs: async (_: any, { limit = 50 }: { limit?: number }, context: GraphQLContext) => {
      requireRole(context, [UserRole.ADMIN]);
      return AppDataSource.getRepository(AuditLog).find({
        order: { createdAt: 'DESC' },
        take: limit,
        relations: ['actor', 'actor.profile'],
      });
    },
  },
};
