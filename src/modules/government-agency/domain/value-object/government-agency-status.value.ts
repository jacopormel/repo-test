import { CodedDomainError, EnumValue, errorResult, okResult, Result } from '@src/common/domain';
import {
  GOVERNMENT_AGENCY_STATUSES,
  GovernmentAgencyStatusType,
} from './government-agency-status.enum';

export class GovernmentAgencyStatus extends EnumValue<typeof GOVERNMENT_AGENCY_STATUSES> {
  protected static validate(
    value: string | null,
  ): Result<GovernmentAgencyStatusType, CodedDomainError> {
    const base = super.validateEnum(value, GOVERNMENT_AGENCY_STATUSES);
    if (!base.ok) {
      return base;
    }
    if (base.value === null) {
      return errorResult([
        new CodedDomainError('Agency status is required', 'status', 'INVALID_ENUM_VALUE'),
      ]);
    }
    return okResult(base.value);
  }

  static create(value: string): Result<GovernmentAgencyStatus, CodedDomainError> {
    const validated = GovernmentAgencyStatus.validate(value);
    if (!validated.ok) {
      return validated;
    }
    return okResult(new GovernmentAgencyStatus(validated.value));
  }

  static reconstitute(value: string): GovernmentAgencyStatus {
    return new GovernmentAgencyStatus(value as GovernmentAgencyStatusType);
  }

  isActive(): boolean {
    return this.value === 'ACTIVE';
  }
}
