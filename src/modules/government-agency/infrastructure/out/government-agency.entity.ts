import {
  DateOnlyTransformer,
  DateTimeTransformer,
  DecimalTransformer,
  IdTransformer,
} from '@pormeldev/axis-service-database-typeorm';
import { DateOnly, DateTime, Decimal, Id } from '@src/common';
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

  @Column({
    name: 'founded_at',
    type: 'date',
    nullable: true,
    transformer: new DateOnlyTransformer(),
  })
  foundedAt: DateOnly | null = null;

  @Column({
    name: 'annual_budget',
    type: 'decimal',
    precision: 18,
    scale: 2,
    nullable: true,
    transformer: new DecimalTransformer(),
  })
  annualBudget: Decimal | null = null;

  @Column({ name: 'internal_id', type: 'integer', generated: 'increment', unique: true })
  internalId!: number;
}
