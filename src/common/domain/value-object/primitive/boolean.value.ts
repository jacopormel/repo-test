import { CodedDomainError } from '../../error';
import { errorResult, okResult, Result } from '../../result';
import { toCreateResult } from '../helpers/to-create-result';
import { PrimitiveValue } from '../primitive-value';

export class BooleanValue extends PrimitiveValue<boolean> {
  protected static validate(
    value: boolean | null | undefined,
  ): Result<boolean | null, CodedDomainError> {
    const base = super.validate(value, 'INVALID_BOOLEAN');
    if (!base.ok) {
      return base;
    }
    if (base.value !== null && typeof base.value !== 'boolean') {
      return errorResult([
        new CodedDomainError('BooleanValue requires a boolean', 'value', 'INVALID_BOOLEAN'),
      ]);
    }
    return okResult(base.value);
  }

  static create(value: boolean | null | undefined): Result<BooleanValue, CodedDomainError> {
    return toCreateResult(BooleanValue.validate(value), (v) => new BooleanValue(v));
  }

  static reconstitute(value: boolean | null): BooleanValue {
    return new BooleanValue(value);
  }
}
