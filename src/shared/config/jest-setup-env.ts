import * as dotenv from 'dotenv';

// Load base environment from .env without logging
dotenv.config({ path: '.env', quiet: true });

// Ensure DB name used by tests has the _test suffix to avoid clobbering dev DB
const baseDbName = process.env.DB_MASTER_DATABASE ?? 'gubernamentales_test';
process.env.DB_MASTER_DATABASE = baseDbName.endsWith('_test')
  ? baseDbName
  : `${baseDbName}_test`;
