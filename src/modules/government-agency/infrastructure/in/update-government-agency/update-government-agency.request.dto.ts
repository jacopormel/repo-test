import { ApiProperty } from '@nestjs/swagger';
import { GOVERNMENT_AGENCY_STATUSES } from '@src/modules/government-agency/domain/value-object/government-agency-status.enum';
import { IsIn, IsString, MinLength, ValidateIf } from 'class-validator';

export class UpdateGovernmentAgencyRequestDto {
  @ApiProperty({
    description: 'New government agency name (minimum 10 characters)',
    example: 'Ministry of Health',
    minLength: 10,
    required: false,
  })
  // ValidateIf (not IsOptional) so an explicit null in the PATCH body is still
  // validated and rejected by IsString - only an omitted key skips validation.
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
}
