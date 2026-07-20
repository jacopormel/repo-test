import { DateTime, Id } from '@pormeldev/axis-common-lib';
import { DateTimeTransformer, IdTransformer } from '@pormeldev/axis-service-database-typeorm';
import { GOVERNMENT_AGENCY_STATUSES } from '@src/modules/government-agency/domain/value-object/government-agency-status.enum';
import { Column, DeleteDateColumn, Entity, PrimaryColumn } from 'typeorm';

@Entity('government_agencies')
export class GovernmentAgencyEntity {
  @PrimaryColumn({ type: 'uuid', transformer: new IdTransformer(Id) })
  id!: Id;

  @Column({ type: 'varchar' })
  name!: string;

  @Column({
    type: 'enum',
    enum: GOVERNMENT_AGENCY_STATUSES,
    enumName: 'government_agencies_status_enum',
    default: 'ACTIVE',
  })
  status!: string;

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
