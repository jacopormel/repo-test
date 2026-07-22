import { ApiProperty } from '@nestjs/swagger';
import { ApiJsonApiType } from '@pormeldev/axis-nestjs-common';

@ApiJsonApiType('government-agencies')
export class CreateGovernmentAgencyResponseDto {
  @ApiProperty({
    description: 'Government agency id',
    example: '019f708a-412b-7666-9d0a-db80dc882284',
  })
  id!: string;
}
