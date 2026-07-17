import { CodedDomainError } from '../../error';
import { errorResult, okResult, Result } from '../../result';
import { PrimitiveValue } from '../primitive-value';

export class BooleanValue extends PrimitiveValue<boolean> {
  protected constructor(value: boolean) {
    super(value);
  }

  static create(value: boolean): Result<BooleanValue, CodedDomainError> {
    if (typeof value !== 'boolean') {
      return errorResult([
        new CodedDomainError('BooleanValue requires a boolean', 'value', 'INVALID_BOOLEAN'),
      ]);
    }
    return okResult(new BooleanValue(value));
  }

  static reconstitute(value: boolean): BooleanValue {
    return new BooleanValue(value);
  }
}
