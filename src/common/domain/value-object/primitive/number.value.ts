import { CodedDomainError } from '../../error';
import { errorResult, okResult, Result } from '../../result';
import { PrimitiveValue } from '../primitive-value';

export class NumberValue extends PrimitiveValue<number> {
  protected constructor(value: number | null) {
    super(value);
  }

  static create(value: number | null | undefined): Result<NumberValue, CodedDomainError> {
    if (value === undefined) {
      return errorResult([
        new CodedDomainError('NumberValue cannot be undefined', 'value', 'INVALID_NUMBER'),
      ]);
    }
    if (value !== null && (typeof value !== 'number' || !Number.isFinite(value))) {
      return errorResult([
        new CodedDomainError('NumberValue requires a finite number', 'value', 'INVALID_NUMBER'),
      ]);
    }
    return okResult(new NumberValue(value));
  }

  static reconstitute(value: number | null): NumberValue {
    return new NumberValue(value);
  }
}
