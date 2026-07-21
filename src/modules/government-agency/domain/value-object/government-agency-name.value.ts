import { CodedDomainError, errorResult, okResult, Result, StringValue } from '@src/common/domain';

const MIN_LENGTH = 10;

export class GovernmentAgencyName extends StringValue {
  protected static validate(value: string | null): Result<string, CodedDomainError> {
    const base = super.validate(value);
    if (!base.ok) {
      return base;
    }
    if (base.value === null) {
      return errorResult([
        new CodedDomainError('Agency name is required', 'name', 'AGENCY_NAME_REQUIRED'),
      ]);
    }
    if (base.value.length < MIN_LENGTH) {
      return errorResult([
        new CodedDomainError(
          `Agency name must be at least ${MIN_LENGTH} characters long`,
          'name',
          'AGENCY_NAME_TOO_SHORT',
        ),
      ]);
    }
    return okResult(base.value);
  }

  static create(value: string): Result<GovernmentAgencyName, CodedDomainError> {
    const validated = GovernmentAgencyName.validate(value);
    if (!validated.ok) {
      return validated;
    }
    return okResult(new GovernmentAgencyName(validated.value));
  }

  static reconstitute(value: string): GovernmentAgencyName {
    return new GovernmentAgencyName(value);
  }
}
