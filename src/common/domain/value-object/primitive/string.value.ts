import { CodedDomainError } from '../../error';
import { errorResult, okResult, Result } from '../../result';
import { PrimitiveValue } from '../primitive-value';

export class StringValue extends PrimitiveValue<string> {
  protected constructor(value: string) {
    super(value);
  }

  static create(value: string): Result<StringValue, CodedDomainError> {
    if (typeof value !== 'string') {
      return errorResult([
        new CodedDomainError('StringValue requires a string', 'value', 'INVALID_STRING'),
      ]);
    }
    return okResult(new StringValue(value));
  }

  static reconstitute(value: string): StringValue {
    return new StringValue(value);
  }
}
