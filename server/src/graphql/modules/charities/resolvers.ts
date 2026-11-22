import { CharityService } from '../../../services/CharityService';
import { GraphQLContext, requireAuth } from '../../context';

const charityService = new CharityService();

export const charitiesResolvers = {
  Query: {
    charities: async (_: any, { filter }: { filter?: any }) => {
      return charityService.getCharities(filter);
    },
    charity: async (_: any, { id, slug }: { id?: string; slug?: string }) => {
      return charityService.getCharity(id, slug);
    },
    myCharityPreference: async (_: any, __: any, context: GraphQLContext) => {
      const user = requireAuth(context);
      return charityService.getMyCharityPreference(user.id);
    },
  },
  Mutation: {
    setCharityPreference: async (
      _: any,
      { charityId, percentage }: { charityId: string; percentage: number },
      context: GraphQLContext
    ) => {
      const user = requireAuth(context);
      return charityService.setCharityPreference(user.id, charityId, percentage);
    },
  },
};
