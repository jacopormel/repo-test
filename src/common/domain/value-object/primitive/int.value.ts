import { CodedDomainError } from '../../error';
import { errorResult, okResult, Result } from '../../result';
import { PrimitiveValue } from '../primitive-value';

export class IntValue extends PrimitiveValue<number> {
  protected constructor(value: number | null) {
    super(value);
  }

  static create(value: number | null | undefined): Result<IntValue, CodedDomainError> {
    if (value === undefined) {
      return errorResult([
        new CodedDomainError('IntValue cannot be undefined', 'value', 'INVALID_INT'),
      ]);
    }
    if (value !== null && !Number.isSafeInteger(value)) {
      return errorResult([
        new CodedDomainError('IntValue requires a safe integer', 'value', 'INVALID_INT'),
      ]);
    }
    return okResult(new IntValue(value));
  }

  static reconstitute(value: number | null): IntValue {
    return new IntValue(value);
  }
}
