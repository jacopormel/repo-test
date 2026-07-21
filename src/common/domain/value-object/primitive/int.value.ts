import { CodedDomainError } from '../../error';
import { errorResult, okResult, Result } from '../../result';
import { PrimitiveValue } from '../primitive-value';

export class IntValue extends PrimitiveValue<number> {
  protected static validate(
    value: number | null | undefined,
  ): Result<number | null, CodedDomainError> {
    const base = super.validate(value, 'INVALID_INT');
    if (!base.ok) {
      return base;
    }
    // The `typeof` check is redundant at runtime - Number.isSafeInteger already
    // returns false for non-numbers - but base.value comes back as `unknown`
    // from PrimitiveValue.validate(), and only `typeof` narrows that for TS.
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
    const validated = IntValue.validate(value);
    if (!validated.ok) {
      return errorResult(validated.errors);
    }
    return okResult(new IntValue(validated.value));
  }

  static reconstitute(value: number | null): IntValue {
    return new IntValue(value);
  }
}
