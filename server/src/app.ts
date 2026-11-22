import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { config } from './config';
import { typeDefs, resolvers } from './graphql/schema';
import { GraphQLContext, buildGraphQLContext } from './graphql/context';

export async function createApp(): Promise<{ app: Application; apolloServer: ApolloServer<GraphQLContext> }> {
  const app: Application = express();

  // Security headers
  app.use(
    helmet({
      crossOriginEmbedderPolicy: false,
      contentSecurityPolicy: config.NODE_ENV === 'production' ? undefined : false,
    })
  );

  // CORS configuration
  app.use(
    cors({
      origin: [config.CLIENT_ORIGIN, 'http://localhost:5173', 'http://127.0.0.1:5173'],
      credentials: true,
    })
  );

  // Raw body preservation for Stripe webhook route before JSON parsing
  app.use('/webhooks/stripe', express.raw({ type: 'application/json' }));

  // Standard JSON and urlencoded parsers
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // REST Health check endpoints
  app.get('/health', (_req: Request, res: Response) => {
    res.status(200).json({
      status: 'UP',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: config.NODE_ENV,
    });
  });

  app.get('/api/v1/health', (_req: Request, res: Response) => {
    res.status(200).json({
      status: 'UP',
      service: 'golf-charity-api',
      version: '1.0.0',
    });
  });

  // Apollo Server 4 integration
  const apolloServer = new ApolloServer<GraphQLContext>({
    typeDefs,
    resolvers,
    formatError: (formattedError) => {
      return formattedError;
    },
  });

  await apolloServer.start();

  app.use(
    '/graphql',
    expressMiddleware<GraphQLContext>(apolloServer, {
      context: async ({ req, res }) => buildGraphQLContext({ req, res }),
    })
  );

  return { app, apolloServer };
}
