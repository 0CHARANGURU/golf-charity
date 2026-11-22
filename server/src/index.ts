import 'reflect-metadata';
import { createApp } from './app';
import { config } from './config';
import { AppDataSource } from './database/dataSource';

async function bootstrap() {
  try {
    // Attempt DB connection
    try {
      await AppDataSource.initialize();
      console.log('PostgreSQL database connection initialized successfully.');
    } catch (dbError) {
      console.warn('PostgreSQL connection deferred or not ready:', (dbError as Error).message);
    }

    const { app } = await createApp();

    const server = app.listen(config.PORT, () => {
      console.log(`Golf Charity Server running at http://localhost:${config.PORT}`);
      console.log(`GraphQL endpoint available at http://localhost:${config.PORT}/graphql`);
      console.log(`Health check at http://localhost:${config.PORT}/health`);
    });

    const shutdown = async () => {
      console.log('Shutting down server gracefully...');
      server.close(async () => {
        if (AppDataSource.isInitialized) {
          await AppDataSource.destroy();
        }
        console.log('Server process terminated.');
        process.exit(0);
      });
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  } catch (error) {
    console.error('Fatal bootstrap error:', error);
    process.exit(1);
  }
}

bootstrap();
