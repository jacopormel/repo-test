import { Logger } from '@nestjs/common';
import { errorResult, okResult, Result } from '@pormeldev/axis-common-lib';
import { QueryRunner } from 'typeorm';
import { SeedInterface } from '../seed.service';

export class GovernmentAgencySeed implements SeedInterface {
  name = 'GovernmentAgencySeed';
  private readonly logger = new Logger(GovernmentAgencySeed.name);

  private readonly agencies = [
    { id: '019f0000-0000-7000-8000-000000000001', name: 'Ministerio de Salud' },
    { id: '019f0000-0000-7000-8000-000000000002', name: 'Ministerio de Educacion' },
    { id: '019f0000-0000-7000-8000-000000000003', name: 'Ministerio de Economia' },
  ];

  async run(queryRunner: QueryRunner): Promise<Result<void, Error>> {
    try {
      for (const agency of this.agencies) {
        const existing = await queryRunner.query(
          'SELECT COUNT(*) as count FROM government_agencies WHERE id = $1',
          [agency.id],
        );

        if (Number(existing[0].count) > 0) {
          continue;
        }

        await queryRunner.query('INSERT INTO government_agencies (id, name) VALUES ($1, $2)', [
          agency.id,
          agency.name,
        ]);
      }

      this.logger.log('Government agencies seeded successfully');
      return okResult(undefined);
    } catch (error) {
      this.logger.error('Error seeding government agencies:', error);
      return errorResult([
        new Error(
          `Failed to seed government agencies: ${error instanceof Error ? error.message : String(error)}`,
        ),
      ]);
    }
  }
}
