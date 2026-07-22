import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class GovernmentAgencyFoundedAtAndAnnualBudget1784655856277 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'government_agencies',
      new TableColumn({
        name: 'founded_at',
        type: 'date',
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      'government_agencies',
      new TableColumn({
        name: 'annual_budget',
        type: 'decimal',
        precision: 18,
        scale: 2,
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('government_agencies', 'annual_budget');
    await queryRunner.dropColumn('government_agencies', 'founded_at');
  }
}
