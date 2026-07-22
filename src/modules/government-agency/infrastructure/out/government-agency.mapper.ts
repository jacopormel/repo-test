import { okResult, Result } from '@src/common';
import { GovernmentAgencyDto } from '../../application/dto/government-agency.dto';
import { GovernmentAgencyMappingError } from '../../application/error/government-agency-mapping.error';
import { GovernmentAgencyEntity } from './government-agency.entity';

export class GovernmentAgencyMapper {
  static mapEntityToDto(
    entity: GovernmentAgencyEntity,
  ): Result<GovernmentAgencyDto, GovernmentAgencyMappingError> {
    return okResult(
      new GovernmentAgencyDto(
        entity.id.toString(),
        entity.name,
        entity.status,
        entity.foundedAt?.toISODate(),
        entity.annualBudget?.toString(),
      ),
    );
  }
}
