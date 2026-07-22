import { okResult, Result } from '@src/common';
import { GovernmentAgency } from '@src/modules/government-agency/domain/government-agency.aggregate';
import { GovernmentAgencyMappingError } from '../../application/error/government-agency-mapping.error';
import { GovernmentAgencyEntity } from './government-agency.entity';

export class GovernmentAgencyWriteMapper {
  static mapDomainToEntity(
    domain: GovernmentAgency,
  ): Result<GovernmentAgencyEntity, GovernmentAgencyMappingError> {
    const entity = new GovernmentAgencyEntity();
    entity.id = domain.getId();
    entity.name = domain.name.value!;
    entity.status = domain.status.value!;
    entity.deletedAt = domain.deletedAt.value ?? undefined;
    entity.foundedAt = domain.foundedAt.value;
    entity.annualBudget = domain.annualBudget.value;
    return okResult(entity);
  }

  static mapEntityToDomain(
    entity: GovernmentAgencyEntity,
  ): Result<GovernmentAgency, GovernmentAgencyMappingError> {
    return okResult(
      GovernmentAgency.reconstitute(entity.id.toString(), {
        name: entity.name,
        status: entity.status,
        deletedAt: entity.deletedAt?.toISO(),
        foundedAt: entity.foundedAt?.toISODate(),
        annualBudget: entity.annualBudget?.toString(),
      }),
    );
  }
}
