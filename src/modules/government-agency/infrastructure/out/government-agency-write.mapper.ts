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
    // name/status are guaranteed non-null by GovernmentAgencyName/GovernmentAgencyStatus
    // (create() never accepts null, reconstitute() never receives it) - the ! just
    // reflects that invariant, it isn't re-validated here.
    entity.name = domain.name.value!;
    entity.status = domain.status.value!;
    entity.deletedAt = domain.deletedAt;
    return okResult(entity);
  }

  static mapEntityToDomain(
    entity: GovernmentAgencyEntity,
  ): Result<GovernmentAgency, GovernmentAgencyMappingError> {
    return okResult(
      GovernmentAgency.reconstitute(entity.id.toString(), {
        name: entity.name,
        status: entity.status,
        deletedAt: entity.deletedAt,
      }),
    );
  }
}
