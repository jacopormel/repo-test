import 'dotenv/config';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DataSource } from 'typeorm';
import { AppModule } from '../../app.module';
import { SeedService } from './seed.service';

async function runSeeds() {
  const logger = new Logger('SeedCommand');

  if (process.env.NODE_ENV === 'production') {
    logger.error('Seeds cannot be run manually when NODE_ENV=production.');
    process.exit(1);
  }

  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const dataSource = app.get(DataSource);
    const seedService = new SeedService(dataSource);

    logger.log('Starting seed process...');

    const result = await seedService.runAllSeeds();

    if (!result.ok) {
      logger.error('Seed failed:', result.errors);
      process.exit(1);
    }

    logger.log('All seeds completed successfully');
  } catch (error) {
    logger.error('Error running seeds:', error);
    process.exit(1);
  } finally {
    await app.close();
  }

  process.exit(0);
}

runSeeds();
