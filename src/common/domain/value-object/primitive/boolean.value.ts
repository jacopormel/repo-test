import { CodedDomainError } from '../../error';
import { errorResult, okResult, Result } from '../../result';
import { PrimitiveValue } from '../primitive-value';

export class BooleanValue extends PrimitiveValue<boolean> {
  protected constructor(value: boolean | null) {
    super(value);
  }

  static create(value: boolean | null | undefined): Result<BooleanValue, CodedDomainError> {
    if (value === undefined) {
      return errorResult([
        new CodedDomainError('BooleanValue cannot be undefined', 'value', 'INVALID_BOOLEAN'),
      ]);
    }
    if (value !== null && typeof value !== 'boolean') {
      return errorResult([
        new CodedDomainError('BooleanValue requires a boolean', 'value', 'INVALID_BOOLEAN'),
      ]);
    }
    return okResult(new BooleanValue(value));
  }

  static reconstitute(value: boolean | null): BooleanValue {
    return new BooleanValue(value);
  }
}
