import { AppDataSource } from '../../../database/dataSource';
import { SubscriptionPlan, Subscription, Payment } from '../../../entities';
import { UserRole, SubscriptionStatus } from '../../../constants';
import { StripeService } from '../../../services/StripeService';
import { GraphQLContext, requireAuth, requireRole } from '../../context';

const stripeService = new StripeService();
const planRepo = AppDataSource.getRepository(SubscriptionPlan);
const subRepo = AppDataSource.getRepository(Subscription);
const paymentRepo = AppDataSource.getRepository(Payment);

export const subscriptionsResolvers = {
  Query: {
    subscriptionPlans: async () => {
      return planRepo.find({ where: { isActive: true }, order: { amountCents: 'ASC' } });
    },
    mySubscription: async (_: any, __: any, context: GraphQLContext) => {
      const user = requireAuth(context);
      return subRepo.findOne({
        where: { userId: user.id },
        order: { createdAt: 'DESC' },
        relations: ['plan'],
      });
    },
    myPayments: async (_: any, __: any, context: GraphQLContext) => {
      const user = requireAuth(context);
      return paymentRepo.find({
        where: { userId: user.id },
        order: { createdAt: 'DESC' },
      });
    },
    adminSubscriptions: async (
      _: any,
      { status }: { status?: SubscriptionStatus },
      context: GraphQLContext
    ) => {
      requireRole(context, [UserRole.ADMIN]);
      const where: any = {};
      if (status) {
        where.status = status;
      }
      return subRepo.find({
        where,
        order: { createdAt: 'DESC' },
        relations: ['plan', 'user', 'user.profile'],
      });
    },
  },
  Mutation: {
    createCheckoutSession: async (
      _: any,
      { planId }: { planId: string },
      context: GraphQLContext
    ) => {
      const user = requireAuth(context);
      return stripeService.createCheckoutSession(user.id, planId);
    },
    syncCheckoutSession: async (
      _: any,
      { sessionId }: { sessionId: string },
      context: GraphQLContext
    ) => {
      const user = requireAuth(context);
      return stripeService.syncCheckoutSession(user.id, sessionId);
    },
  },
};
