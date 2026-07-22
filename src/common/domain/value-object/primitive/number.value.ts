import { CodedDomainError } from '../../error';
import { errorResult, okResult, Result } from '../../result';
import { toCreateResult } from '../helpers/to-create-result';
import { PrimitiveValue } from '../primitive-value';

export class NumberValue extends PrimitiveValue<number> {
  protected static validate(
    value: number | null | undefined,
  ): Result<number | null, CodedDomainError> {
    const base = super.validate(value, 'INVALID_NUMBER');
    if (!base.ok) {
      return base;
    }
    if (base.value !== null && (typeof base.value !== 'number' || !Number.isFinite(base.value))) {
      return errorResult([
        new CodedDomainError('NumberValue requires a finite number', 'value', 'INVALID_NUMBER'),
      ]);
    }
    return okResult(base.value);
  }

  static create(value: number | null | undefined): Result<NumberValue, CodedDomainError> {
    return toCreateResult(NumberValue.validate(value), (v) => new NumberValue(v));
  }

  static reconstitute(value: number | null): NumberValue {
    return new NumberValue(value);
  }
}
