import * as dotenv from 'dotenv';
import { Client } from 'pg';

export default async function globalSetup(): Promise<void> {
  dotenv.config({ path: '.env', quiet: true });

  const baseDbName = process.env.DB_MASTER_DATABASE ?? 'gubernamentales_test';
  const testDbName = baseDbName.endsWith('_test') ? baseDbName : `${baseDbName}_test`;

  const client = new Client({
    host: process.env.DB_MASTER_HOST,
    port: Number(process.env.DB_MASTER_PORT),
    user: process.env.DB_MASTER_USERNAME,
    password: process.env.DB_MASTER_PASSWORD,
    database: process.env.DB_MASTER_DATABASE,
  });

  await client.connect();
  try {
    const { rowCount } = await client.query('SELECT 1 FROM pg_database WHERE datname = $1', [
      testDbName,
    ]);
    if (rowCount === 0) {
      await client.query(`CREATE DATABASE "${testDbName}"`);
    }
  } finally {
    await client.end();
  }
}
