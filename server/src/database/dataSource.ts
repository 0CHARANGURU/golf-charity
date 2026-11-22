import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { config } from '../config';
import * as Entities from '../entities';
import { SnakeNamingStrategy } from './namingStrategy';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: config.DB_HOST,
  port: config.DB_PORT,
  username: config.DB_USER,
  password: config.DB_PASSWORD,
  database: config.DB_NAME,
  synchronize: false, // Strict migration control
  logging: config.DB_LOGGING,
  namingStrategy: new SnakeNamingStrategy(),
  entities: Object.values(Entities),
  migrations: [__dirname + '/migrations/**/*.{ts,js}'],
  subscribers: [],
});
