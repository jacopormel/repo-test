import { Decimal } from '../../data-type';
import { CodedDomainError } from '../../error';
import { errorResult, okResult, Result } from '../../result';
import { toCreateResult } from '../helpers/to-create-result';
import { OpaqueValue } from '../opaque-value';

export class DecimalValue extends OpaqueValue<Decimal> {
  protected static validate(
    value: string | null | undefined,
  ): Result<Decimal | null, CodedDomainError> {
    const base = super.validate(value, 'INVALID_DECIMAL');
    if (!base.ok) {
      return base;
    }
    const raw = base.value;
    if (raw === null) {
      return okResult(null);
    }
    if (typeof raw !== 'string') {
      return errorResult([
        new CodedDomainError('DecimalValue requires a numeric string', 'value', 'INVALID_DECIMAL'),
      ]);
    }
    return DecimalValue.parse(() => new Decimal(raw), 'INVALID_DECIMAL');
  }

  static create(value: string | null | undefined): Result<DecimalValue, CodedDomainError> {
    return toCreateResult(DecimalValue.validate(value), (v) => new DecimalValue(v));
  }

  static reconstitute(value: string | null): DecimalValue {
    return new DecimalValue(DecimalValue.mapNullable(value, (raw) => new Decimal(raw)));
  }

  public toJSON(): string | null {
    return DecimalValue.mapNullable(this.value, (value) => value.toString());
  }
}
