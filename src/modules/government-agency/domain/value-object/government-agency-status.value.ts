import { CodedDomainError, EnumValue, errorResult, Result } from '@src/common';
import {
  GOVERNMENT_AGENCY_STATUSES,
  GovernmentAgencyStatusType,
} from './government-agency-status.enum';

export class GovernmentAgencyStatus extends EnumValue<typeof GOVERNMENT_AGENCY_STATUSES> {
  public override get value(): GovernmentAgencyStatusType {
    return super.value as GovernmentAgencyStatusType;
  }

  static create(value: string | null): Result<GovernmentAgencyStatus, CodedDomainError> {
    if (value === null) {
      return errorResult([
        new CodedDomainError('Agency status is required', 'status', 'INVALID_ENUM_VALUE'),
      ]);
    }

    return GovernmentAgencyStatus.validate(
      value,
      GOVERNMENT_AGENCY_STATUSES,
      (v) => new GovernmentAgencyStatus(v),
    );
  }

  static reconstitute(value: string): GovernmentAgencyStatus {
    return new GovernmentAgencyStatus(value as GovernmentAgencyStatusType);
  }

  isActive(): boolean {
    return this.value === 'ACTIVE';
  }
}
