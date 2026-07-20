import { CodedDomainError } from '../../error';
import { errorResult, okResult, Result } from '../../result';
import { PrimitiveValue } from '../primitive-value';

export class StringValue extends PrimitiveValue<string> {
  protected constructor(value: string | null) {
    super(value);
  }

  static create(value: string | null | undefined): Result<StringValue, CodedDomainError> {
    if (value === undefined) {
      return errorResult([
        new CodedDomainError('StringValue cannot be undefined', 'value', 'INVALID_STRING'),
      ]);
    }
    if (value !== null && typeof value !== 'string') {
      return errorResult([
        new CodedDomainError('StringValue requires a string', 'value', 'INVALID_STRING'),
      ]);
    }
    return okResult(new StringValue(value));
  }

  static reconstitute(value: string | null): StringValue {
    return new StringValue(value);
  }
}
