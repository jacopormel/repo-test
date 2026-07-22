import { CodedDomainError } from '../../error';
import { errorResult, okResult, Result } from '../../result';
import { toCreateResult } from '../helpers/to-create-result';
import { PrimitiveValue } from '../primitive-value';

export class IntValue extends PrimitiveValue<number> {
  protected static validate(
    value: number | null | undefined,
  ): Result<number | null, CodedDomainError> {
    const base = super.validate(value, 'INVALID_INT');
    if (!base.ok) {
      return base;
    }
    if (
      base.value !== null &&
      (typeof base.value !== 'number' || !Number.isSafeInteger(base.value))
    ) {
      return errorResult([
        new CodedDomainError('IntValue requires a safe integer', 'value', 'INVALID_INT'),
      ]);
    }
    return okResult(base.value);
  }

  static create(value: number | null | undefined): Result<IntValue, CodedDomainError> {
    return toCreateResult(IntValue.validate(value), (v) => new IntValue(v));
  }

  static reconstitute(value: number | null): IntValue {
    return new IntValue(value);
  }
}
