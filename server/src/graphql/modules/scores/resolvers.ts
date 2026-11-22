import { GolfScoreService } from '../../../services/GolfScoreService';
import { GraphQLContext, requireAuth } from '../../context';

const scoreService = new GolfScoreService();

export const scoresResolvers = {
  Query: {
    myScores: async (_: any, { includeArchived }: { includeArchived?: boolean }, context: GraphQLContext) => {
      const user = requireAuth(context);
      return scoreService.getMyScores(user.id, includeArchived);
    },
  },
  Mutation: {
    submitScore: async (_: any, { input }: { input: any }, context: GraphQLContext) => {
      const user = requireAuth(context);
      return scoreService.submitScore(user.id, input);
    },
    updateScore: async (_: any, { input }: { input: any }, context: GraphQLContext) => {
      const user = requireAuth(context);
      return scoreService.updateScore(user.id, input.id, input);
    },
    deleteScore: async (_: any, { id }: { id: string }, context: GraphQLContext) => {
      const user = requireAuth(context);
      return scoreService.deleteScore(user.id, id);
    },
  },
};
