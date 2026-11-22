import { AppDataSource } from '../../../database/dataSource';
import { Notification } from '../../../entities';
import { UserRole, PayoutStatus } from '../../../constants';
import { WinnerVerificationService } from '../../../services/WinnerVerificationService';
import { PayoutService } from '../../../services/PayoutService';
import { GraphQLContext, requireAuth, requireRole } from '../../context';

const verificationService = new WinnerVerificationService();
const payoutService = new PayoutService();
const notifRepo = AppDataSource.getRepository(Notification);

export const winningsResolvers = {
  Query: {
    myWinnings: async (_: any, __: any, context: GraphQLContext) => {
      const user = requireAuth(context);
      return verificationService.getMyWinnings(user.id);
    },
    myPayouts: async (_: any, __: any, context: GraphQLContext) => {
      const user = requireAuth(context);
      return payoutService.getMyPayouts(user.id);
    },
    myNotifications: async (_: any, { unreadOnly }: { unreadOnly?: boolean }, context: GraphQLContext) => {
      const user = requireAuth(context);
      const where: any = { userId: user.id };
      if (unreadOnly) {
        where.isRead = false;
      }
      return notifRepo.find({ where, order: { createdAt: 'DESC' } });
    },
    adminPendingWinners: async (_: any, __: any, context: GraphQLContext) => {
      requireRole(context, [UserRole.ADMIN]);
      return verificationService.getAdminPendingWinners();
    },
    adminPayouts: async (_: any, { status }: { status?: PayoutStatus }, context: GraphQLContext) => {
      requireRole(context, [UserRole.ADMIN]);
      return payoutService.getAdminPayouts(status);
    },
  },
  Mutation: {
    submitWinnerProof: async (_: any, { input }: { input: any }, context: GraphQLContext) => {
      const user = requireAuth(context);
      return verificationService.submitProof(user.id, input);
    },
    adminVerifyWinner: async (
      _: any,
      { winnerId, approve, rejectionReason }: { winnerId: string; approve: boolean; rejectionReason?: string },
      context: GraphQLContext
    ) => {
      const user = requireRole(context, [UserRole.ADMIN]);
      return verificationService.adminVerifyWinner(user.id, winnerId, approve, rejectionReason);
    },
    adminProcessPayout: async (
      _: any,
      { winnerId, payoutMethod }: { winnerId: string; payoutMethod?: string },
      context: GraphQLContext
    ) => {
      const user = requireRole(context, [UserRole.ADMIN]);
      return payoutService.processPayout(user.id, winnerId, payoutMethod);
    },
    markNotificationAsRead: async (_: any, { id }: { id: string }, context: GraphQLContext) => {
      const user = requireAuth(context);
      await notifRepo.update({ id, userId: user.id }, { isRead: true });
      return true;
    },
  },
};
