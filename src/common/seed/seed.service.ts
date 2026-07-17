import { Injectable, Logger } from '@nestjs/common';
import { errorResult, okResult, Result } from '@pormeldev/axis-common-lib';
import { DataSource, QueryRunner } from 'typeorm';
import { GovernmentAgencySeed } from './data/government-agency.seed';

export interface SeedInterface {
  name: string;
  run(queryRunner: QueryRunner): Promise<Result<void, Error>>;
}

@Injectable()
export class SeedService {
  private readonly logger = new Logger(SeedService.name);

  constructor(private readonly dataSource: DataSource) {}

  async runSeed(seed: SeedInterface): Promise<Result<void, Error>> {
    this.logger.log(`Running seed: ${seed.name}`);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const result = await seed.run(queryRunner);

      if (!result.ok) {
        await queryRunner.rollbackTransaction();
        return result;
      }

      await queryRunner.commitTransaction();
      this.logger.log(`Seed ${seed.name} completed successfully`);
      return okResult(undefined);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`Error running seed ${seed.name}:`, error);
      return errorResult([
        new Error(
          `Failed to run seed ${seed.name}: ${error instanceof Error ? error.message : String(error)}`,
        ),
      ]);
    } finally {
      await queryRunner.release();
    }
  }

  async runAllSeeds(seeds?: SeedInterface[]): Promise<Result<void, Error>> {
    const seedsToRun = seeds || this.getAllAvailableSeeds();

    for (const seed of seedsToRun) {
      const result = await this.runSeed(seed);
      if (!result.ok) {
        return result;
      }
    }
    return okResult(undefined);
  }

  getAllAvailableSeeds(): SeedInterface[] {
    return [new GovernmentAgencySeed()];
  }
}
