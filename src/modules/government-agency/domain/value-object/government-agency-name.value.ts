import { CodedDomainError, errorResult, okResult, Result, StringValue } from '@src/common';

const MIN_LENGTH = 10;

export class GovernmentAgencyName extends StringValue {
  public override get value(): string {
    return super.value as string;
  }

  static create(value: string | null): Result<GovernmentAgencyName, CodedDomainError> {
    if (value === null) {
      return errorResult([
        new CodedDomainError('Agency name is required', 'name', 'AGENCY_NAME_REQUIRED'),
      ]);
    }

    const stringResult = StringValue.create(value);
    if (!stringResult.ok) {
      return errorResult(stringResult.errors);
    }

    if (value.length < MIN_LENGTH) {
      return errorResult([
        new CodedDomainError(
          `Agency name must be at least ${MIN_LENGTH} characters long`,
          'name',
          'AGENCY_NAME_TOO_SHORT',
        ),
      ]);
    }
    return okResult(new GovernmentAgencyName(value));
  }

  static reconstitute(value: string): GovernmentAgencyName {
    return new GovernmentAgencyName(value);
  }
}
