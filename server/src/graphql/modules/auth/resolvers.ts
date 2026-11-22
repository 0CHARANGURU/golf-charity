import { AuthService } from '../../../services/AuthService';
import { GraphQLContext, requireAuth } from '../../context';

const authService = new AuthService();

export const authResolvers = {
  Query: {
    me: async (_: any, __: any, context: GraphQLContext) => {
      const user = requireAuth(context);
      return user;
    },
  },
  Mutation: {
    register: async (_: any, { input }: { input: any }) => {
      return authService.register(input);
    },
    login: async (_: any, { input }: { input: { email: string; password: string } }) => {
      return authService.login(input.email, input.password);
    },
    refreshToken: async (_: any, { token }: { token: string }) => {
      return authService.refreshToken(token);
    },
    logout: async (_: any, { refreshToken }: { refreshToken?: string }, context: GraphQLContext) => {
      const user = requireAuth(context);
      return authService.logout(user.id, refreshToken);
    },
    forgotPassword: async (_: any, { email }: { email: string }) => {
      return authService.forgotPassword(email);
    },
    resetPassword: async (_: any, { token, newPassword }: { token: string; newPassword: string }) => {
      return authService.resetPassword(token, newPassword);
    },
    verifyEmail: async (_: any, { token }: { token: string }) => {
      return authService.verifyEmail(token);
    },
  },
};
