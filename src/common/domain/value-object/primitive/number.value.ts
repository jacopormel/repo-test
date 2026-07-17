import { CodedDomainError } from '../../error';
import { errorResult, okResult, Result } from '../../result';
import { PrimitiveValue } from '../primitive-value';

export class NumberValue extends PrimitiveValue<number> {
  protected constructor(value: number) {
    super(value);
  }

  static create(value: number): Result<NumberValue, CodedDomainError> {
    if (typeof value !== 'number' || !Number.isFinite(value)) {
      return errorResult([
        new CodedDomainError('NumberValue requires a finite number', 'value', 'INVALID_NUMBER'),
      ]);
    }
    return okResult(new NumberValue(value));
  }

  static reconstitute(value: number): NumberValue {
    return new NumberValue(value);
  }
}
