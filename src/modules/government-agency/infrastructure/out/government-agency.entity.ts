import { DateTime, Id } from '@pormeldev/axis-common-lib';
import { DateTimeTransformer, IdTransformer } from '@pormeldev/axis-service-database-typeorm';
import { Column, DeleteDateColumn, Entity, PrimaryColumn } from 'typeorm';

@Entity('government_agencies')
export class GovernmentAgencyEntity {
  @PrimaryColumn({ type: 'uuid', transformer: new IdTransformer(Id) })
  id!: Id;

  @Column({ type: 'varchar' })
  name!: string;

  @DeleteDateColumn({
    name: 'deleted_at',
    type: 'timestamptz',
    nullable: true,
    transformer: new DateTimeTransformer(),
  })
  deletedAt?: DateTime;

  @Column({ name: 'internal_id', type: 'integer', generated: 'increment', unique: true })
  internalId!: number;
}
