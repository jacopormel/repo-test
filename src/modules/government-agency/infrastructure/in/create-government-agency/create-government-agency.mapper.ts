import { CreateGovernmentAgencyResponseDto } from './create-government-agency.response.dto';

export class CreateGovernmentAgencyMapper {
  static mapSuccessResultToHttpResponse(id: string): { data: CreateGovernmentAgencyResponseDto } {
    const dto = new CreateGovernmentAgencyResponseDto();
    dto.id = id;
    return { data: dto };
  }
}
