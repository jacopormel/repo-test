import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateGovernmentAgencyRequestDto {
  @ApiProperty({
    description: 'New government agency name (minimum 10 characters)',
    example: 'Ministry of Health',
    minLength: 10,
  })
  @IsString()
  @MinLength(10)
  name!: string;
}
