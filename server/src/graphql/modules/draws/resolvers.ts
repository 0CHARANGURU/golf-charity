import { AppDataSource } from '../../../database/dataSource';
import { Draw, DrawConfiguration, DrawEntry, DrawSimulation } from '../../../entities';
import { DrawStatus, UserRole } from '../../../constants';
import { DrawEngineService } from '../../../services/DrawEngineService';
import { GraphQLContext, requireAuth, requireRole } from '../../context';

const drawEngine = new DrawEngineService();
const drawRepo = AppDataSource.getRepository(Draw);
const configRepo = AppDataSource.getRepository(DrawConfiguration);
const entryRepo = AppDataSource.getRepository(DrawEntry);

export const drawsResolvers = {
  Query: {
    upcomingDraw: async () => {
      return drawRepo.findOne({
        where: { status: DrawStatus.SCHEDULED },
        order: { scheduledAt: 'ASC' },
        relations: ['configuration', 'prizePool', 'prizePool.tiers'],
      });
    },
    pastDraws: async (_: any, { limit = 10 }: { limit?: number }) => {
      return drawRepo.find({
        where: { status: DrawStatus.PUBLISHED },
        order: { executedAt: 'DESC' },
        take: limit,
        relations: ['configuration', 'result', 'prizePool', 'prizePool.tiers'],
      });
    },
    draw: async (_: any, { id }: { id: string }) => {
      return drawRepo.findOne({
        where: { id },
        relations: ['configuration', 'result', 'prizePool', 'prizePool.tiers'],
      });
    },
    myDrawEntries: async (_: any, { drawId }: { drawId: string }, context: GraphQLContext) => {
      const user = requireAuth(context);
      return entryRepo.find({
        where: { drawId, userId: user.id },
        order: { createdAt: 'DESC' },
      });
    },
    drawConfigurations: async () => {
      return configRepo.find({ where: { isActive: true } });
    },
  },
  Mutation: {
    adminCreateDraw: async (
      _: any,
      { name, scheduledAt, configurationId }: { name: string; scheduledAt: string; configurationId: string },
      context: GraphQLContext
    ) => {
      requireRole(context, [UserRole.ADMIN]);

      // Get next draw number
      const maxDraw = await drawRepo
        .createQueryBuilder('d')
        .select('MAX(d.drawNumber)', 'max')
        .getRawOne();
      const nextNumber = (maxDraw?.max ? parseInt(maxDraw.max, 10) : 0) + 1;

      const draw = drawRepo.create({
        drawConfigurationId: configurationId,
        drawNumber: nextNumber,
        name,
        scheduledAt: new Date(scheduledAt),
        status: DrawStatus.SCHEDULED,
      });

      return drawRepo.save(draw);
    },
    adminExecuteDraw: async (_: any, { drawId }: { drawId: string }, context: GraphQLContext) => {
      requireRole(context, [UserRole.ADMIN]);
      return drawEngine.executeDraw(drawId);
    },
    adminRunSimulation: async (
      _: any,
      { configurationId, count, mode }: { configurationId: string; count: number; mode?: any },
      context: GraphQLContext
    ) => {
      const user = requireRole(context, [UserRole.ADMIN]);
      return drawEngine.runSimulation(configurationId, user.id, count, mode);
    },
  },
};
