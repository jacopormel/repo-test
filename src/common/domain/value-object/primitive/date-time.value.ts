import { DateTime } from '../../data-type';
import { CodedDomainError } from '../../error';
import { errorResult, okResult, Result } from '../../result';
import { toCreateResult } from '../helpers/to-create-result';
import { OpaqueValue } from '../opaque-value';

export class DateTimeValue extends OpaqueValue<DateTime> {
  protected static validate(
    value: string | null | undefined,
  ): Result<DateTime | null, CodedDomainError> {
    const base = super.validate(value, 'INVALID_DATETIME');
    if (!base.ok) {
      return base;
    }
    const raw = base.value;
    if (raw === null) {
      return okResult(null);
    }
    if (typeof raw !== 'string') {
      return errorResult([
        new CodedDomainError('DateTimeValue requires an ISO 8601 string', 'value', 'INVALID_DATETIME'),
      ]);
    }
    return DateTimeValue.parse(() => DateTime.fromISO(raw), 'INVALID_DATETIME');
  }

  static create(value: string | null | undefined): Result<DateTimeValue, CodedDomainError> {
    return toCreateResult(DateTimeValue.validate(value), (v) => new DateTimeValue(v));
  }

  static now(): DateTimeValue {
    return new DateTimeValue(DateTime.now());
  }

  // DateTime has no public constructor to bypass fromISO() with, so unlike
  // StringValue/IntValue's reconstitute() (which build the wrapped primitive
  // directly), this still goes through the one throwing factory the vendor
  // exposes. Consistent with other reconstitute() methods in this codebase
  // (e.g. GovernmentAgencyStatus), it trusts persisted data and does not
  // re-validate - a corrupted DB value would still throw here, same risk as
  // any other reconstitute() path.
  static reconstitute(value: string | null): DateTimeValue {
    return new DateTimeValue(DateTimeValue.mapNullable(value, DateTime.fromISO));
  }

  public toJSON(): string | null {
    return DateTimeValue.mapNullable(this.value, (value) => value.toISO());
  }
}
