import { ApiProperty } from '@nestjs/swagger';
import { ApiJsonApiType } from '@pormeldev/axis-nestjs-common';
import { GOVERNMENT_AGENCY_STATUSES } from '@src/modules/government-agency/domain/value-object/government-agency-status.enum';

@ApiJsonApiType('government-agencies')
export class GovernmentAgencyResponseDto {
  @ApiProperty({
    description: 'Government agency id',
    example: '019f708a-412b-7666-9d0a-db80dc882284',
  })
  id!: string;

  @ApiProperty({
    description: 'Government agency name',
    example: 'Ministry of Health',
  })
  name!: string;

  @ApiProperty({
    description: 'Government agency status',
    example: 'ACTIVE',
    enum: GOVERNMENT_AGENCY_STATUSES,
  })
  status!: string;
}
