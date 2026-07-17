import { CodedDomainError } from '../../error';
import { errorResult, okResult, Result } from '../../result';
import { PrimitiveValue } from '../primitive-value';

export class IntValue extends PrimitiveValue<number> {
  protected constructor(value: number) {
    super(value);
  }

  static create(value: number): Result<IntValue, CodedDomainError> {
    if (!Number.isSafeInteger(value)) {
      return errorResult([
        new CodedDomainError('IntValue requires a safe integer', 'value', 'INVALID_INT'),
      ]);
    }
    return okResult(new IntValue(value));
  }

  static reconstitute(value: number): IntValue {
    return new IntValue(value);
  }
}
