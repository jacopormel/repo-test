import { ApiProperty } from '@nestjs/swagger';
import { GOVERNMENT_AGENCY_STATUSES } from '@src/modules/government-agency/domain/value-object/government-agency-status.enum';
import {
  IsDateString,
  IsDecimal,
  IsIn,
  IsOptional,
  IsString,
  MinLength,
  ValidateIf,
} from 'class-validator';

export class UpdateGovernmentAgencyRequestDto {
  @ApiProperty({
    description: 'New government agency name (minimum 10 characters)',
    example: 'Ministry of Health',
    minLength: 10,
    required: false,
  })
  @ValidateIf((dto) => dto.name !== undefined)
  @IsString()
  @MinLength(10)
  name?: string;

  @ApiProperty({
    description: 'New government agency status',
    example: 'ACTIVE',
    enum: GOVERNMENT_AGENCY_STATUSES,
    required: false,
  })
  @ValidateIf((dto) => dto.status !== undefined)
  @IsIn(GOVERNMENT_AGENCY_STATUSES)
  status?: string;

  @ApiProperty({
    description: 'New government agency founding date (YYYY-MM-DD)',
    example: '1990-01-01',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  foundedAt?: string;

  @ApiProperty({
    description: 'New government agency annual budget (decimal string)',
    example: '150000.50',
    required: false,
  })
  @IsOptional()
  @IsDecimal()
  annualBudget?: string;
}
