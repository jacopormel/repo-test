import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class GovernmentAgencySoftDeleteAndInternalId1784310086029 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'government_agencies',
      new TableColumn({
        name: 'deleted_at',
        type: 'timestamptz',
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      'government_agencies',
      new TableColumn({
        name: 'internal_id',
        type: 'integer',
        isGenerated: true,
        generationStrategy: 'increment',
        isNullable: false,
        isUnique: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('government_agencies', 'internal_id');
    await queryRunner.dropColumn('government_agencies', 'deleted_at');
  }
}
