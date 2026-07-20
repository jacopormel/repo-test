import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class GovernmentAgencyStatus1784320000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'government_agencies',
      new TableColumn({
        name: 'status',
        type: 'enum',
        enum: ['ACTIVE', 'INACTIVE'],
        enumName: 'government_agencies_status_enum',
        isNullable: false,
        default: "'ACTIVE'",
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('government_agencies', 'status');
  }
}
