import {
  CodedDomainError,
  Decimal,
  DecimalValue,
  errorResult,
  okResult,
  Result,
  toCreateResult,
} from '@src/common/domain';

export class GovernmentAgencyAnnualBudget extends DecimalValue {
  protected static validate(
    value: string | null | undefined,
  ): Result<Decimal | null, CodedDomainError> {
    const base = super.validate(value);
    if (!base.ok) {
      return base;
    }
    if (base.value !== null && base.value.isNegative()) {
      return errorResult([
        new CodedDomainError(
          'Annual budget cannot be negative',
          'annualBudget',
          'AGENCY_ANNUAL_BUDGET_NEGATIVE',
        ),
      ]);
    }
    return okResult(base.value);
  }

  static create(
    value: string | null | undefined,
  ): Result<GovernmentAgencyAnnualBudget, CodedDomainError> {
    return toCreateResult(
      GovernmentAgencyAnnualBudget.validate(value),
      (v) => new GovernmentAgencyAnnualBudget(v),
    );
  }

  static reconstitute(value: string | null): GovernmentAgencyAnnualBudget {
    return new GovernmentAgencyAnnualBudget(
      GovernmentAgencyAnnualBudget.mapNullable(value, (raw) => new Decimal(raw)),
    );
  }
}
