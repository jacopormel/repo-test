import {
  CodedDomainError,
  DateTime,
  DateTimeValue,
  Result,
  toCreateResult,
} from '@src/common/domain';

export class GovernmentAgencyDeletedAt extends DateTimeValue {
  static create(
    value: string | null | undefined,
  ): Result<GovernmentAgencyDeletedAt, CodedDomainError> {
    return toCreateResult(
      GovernmentAgencyDeletedAt.validate(value),
      (v) => new GovernmentAgencyDeletedAt(v),
    );
  }

  static reconstitute(value: string | null): GovernmentAgencyDeletedAt {
    return new GovernmentAgencyDeletedAt(GovernmentAgencyDeletedAt.mapNullable(value, DateTime.fromISO));
  }

  static now(): GovernmentAgencyDeletedAt {
    return new GovernmentAgencyDeletedAt(DateTime.now());
  }
}
