import { ApiProperty } from '@nestjs/swagger';
import { GOVERNMENT_AGENCY_STATUSES } from '@src/modules/government-agency/domain/value-object/government-agency-status.enum';
import { IsDateString, IsDecimal, IsIn, IsNotEmpty, IsOptional, IsString, MinLength, ValidateIf } from 'class-validator';

export class CreateGovernmentAgencyRequestDto {
  @ApiProperty({
    description: 'Government agency name (minimum 10 characters)',
    example: 'Ministry of Health',
    minLength: 10,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  name!: string;

  @ApiProperty({
    description: 'Government agency status',
    example: 'ACTIVE',
    enum: GOVERNMENT_AGENCY_STATUSES,
  })
  @IsIn(GOVERNMENT_AGENCY_STATUSES)
  status!: string;

  @ApiProperty({
    description: 'Government agency founding date (YYYY-MM-DD)',
    example: '1990-01-01',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  foundedAt?: string;

  @ApiProperty({
    description: 'Government agency annual budget (decimal string)',
    example: '150000.50',
    required: false,
  })
  @IsOptional()
  @IsDecimal()
  annualBudget?: string;
}
