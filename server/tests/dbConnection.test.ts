import 'reflect-metadata';
import { AppDataSource } from '../src/database/dataSource';

async function testDbConnection() {
  console.log('Testing AppDataSource connection to PostgreSQL...');
  try {
    await AppDataSource.initialize();
    console.log('AppDataSource initialized successfully!');
    const result = await AppDataSource.query('SELECT current_database(), current_user, version();');
    console.log('Database Query Result:', result[0]);
    await AppDataSource.destroy();
    console.log('AppDataSource closed cleanly.');
  } catch (error) {
    console.error('AppDataSource connection error:', error);
    process.exit(1);
  }
}

testDbConnection();
