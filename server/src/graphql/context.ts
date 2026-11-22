import { Request, Response } from 'express';
import { GraphQLError } from 'graphql';
import { AppDataSource } from '../database/dataSource';
import { User } from '../entities';
import { UserRole } from '../constants';
import { verifyAccessToken } from '../utils/jwt';

export interface GraphQLContext {
  req: Request;
  res: Response;
  user: User | null;
}

export async function buildGraphQLContext({
  req,
  res,
}: {
  req: Request;
  res: Response;
}): Promise<GraphQLContext> {
  let user: User | null = null;
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim();
    try {
      const payload = verifyAccessToken(token);
      user = await AppDataSource.getRepository(User).findOne({
        where: { id: payload.sub },
        relations: ['profile'],
      });
    } catch {
      // Invalid token, user remains null
    }
  }

  return { req, res, user };
}

export function requireAuth(context: GraphQLContext): User {
  if (!context.user) {
    throw new GraphQLError('Authentication required. Please log in.', {
      extensions: { code: 'UNAUTHENTICATED', http: { status: 401 } },
    });
  }
  return context.user;
}

export function requireRole(context: GraphQLContext, roles: UserRole[]): User {
  const user = requireAuth(context);
  if (!roles.includes(user.role)) {
    throw new GraphQLError(
      `Access denied. Requires one of the following roles: ${roles.join(', ')}`,
      {
        extensions: { code: 'FORBIDDEN', http: { status: 403 } },
      }
    );
  }
  return user;
}
