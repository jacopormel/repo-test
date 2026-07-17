import { UserMigrationScripts } from '@pormeldev/axis-nestjs-common';
import { MigrationInterface, QueryRunner } from 'typeorm';

export class User1750707484817 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const upScripts = new UserMigrationScripts(queryRunner.connection).getUpScript();
    for (const script of upScripts) {
      console.log('upScript', script);
      await queryRunner.query(script);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const downScript = new UserMigrationScripts(queryRunner.connection).getDownScript();
    for (const script of downScript) {
      console.log('downScript', script);
      await queryRunner.query(script);
    }
  }
}
