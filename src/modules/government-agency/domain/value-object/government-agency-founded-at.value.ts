import {
  CodedDomainError,
  DateOnly,
  DateOnlyValue,
  Result,
  toCreateResult,
} from '@src/common/domain';

export class GovernmentAgencyFoundedAt extends DateOnlyValue {
  static create(
    value: string | null | undefined,
  ): Result<GovernmentAgencyFoundedAt, CodedDomainError> {
    return toCreateResult(
      GovernmentAgencyFoundedAt.validate(value),
      (v) => new GovernmentAgencyFoundedAt(v),
    );
  }

  static reconstitute(value: string | null): GovernmentAgencyFoundedAt {
    return new GovernmentAgencyFoundedAt(
      GovernmentAgencyFoundedAt.mapNullable(value, DateOnly.fromISODate),
    );
  }
}
