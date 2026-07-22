import { CodedDomainError } from '../../error';
import { errorResult, okResult, Result } from '../../result';
import { toCreateResult } from '../helpers/to-create-result';
import { PrimitiveValue } from '../primitive-value';

export class StringValue extends PrimitiveValue<string> {
  protected static validate(
    value: string | null | undefined,
  ): Result<string | null, CodedDomainError> {
    const base = super.validate(value, 'INVALID_STRING');
    if (!base.ok) {
      return base;
    }
    if (base.value !== null && typeof base.value !== 'string') {
      return errorResult([
        new CodedDomainError('StringValue requires a string', 'value', 'INVALID_STRING'),
      ]);
    }
    return okResult(base.value);
  }

  static create(value: string | null | undefined): Result<StringValue, CodedDomainError> {
    return toCreateResult(StringValue.validate(value), (v) => new StringValue(v));
  }

  static reconstitute(value: string | null): StringValue {
    return new StringValue(value);
  }
}
