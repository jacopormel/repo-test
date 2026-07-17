import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

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
}
