import { ApiProperty } from '@nestjs/swagger';
import { ApiJsonApiType } from '@pormeldev/axis-nestjs-common';

@ApiJsonApiType('government-agencies')
export class CreateGovernmentAgencyResponseDto {
  @ApiProperty({
    description: 'Government agency id',
    example: '019f708a-412b-7666-9d0a-db80dc882284',
  })
  id!: string;

  @ApiProperty({
    description: 'Government agency founding date (YYYY-MM-DD)',
    example: '1990-01-01',
    required: false,
    nullable: true,
  })
  foundedAt?: string;

  @ApiProperty({
    description: 'Government agency annual budget (decimal string)',
    example: '150000.50',
    required: false,
    nullable: true,
  })
  annualBudget?: string;
}
