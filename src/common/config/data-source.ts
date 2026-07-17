import 'dotenv/config';
import * as path from 'path';
import { DataSource } from 'typeorm';
import { buildBasicDataSourceOptionsFromEnv } from './db-config';

const root = process.cwd();

/** DataSource for the TypeORM CLI (migration:generate/create/run/revert). */
export const AppDataSource = new DataSource({
  ...buildBasicDataSourceOptionsFromEnv(),
  entities: [path.join(root, 'src', '**', '*.entity.ts')],
  migrations: [path.join(root, 'src', '**', 'migration', '*.ts')],
  migrationsTableName: 'migrations',
});
