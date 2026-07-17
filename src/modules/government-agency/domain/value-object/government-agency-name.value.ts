import { CodedDomainError, errorResult, okResult, Result, StringValue } from '@src/common';

const MIN_LENGTH = 10;

export class GovernmentAgencyName extends StringValue {
  static create(value: string): Result<GovernmentAgencyName, CodedDomainError> {
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
