import { DateOnly } from '../../data-type';
import { CodedDomainError } from '../../error';
import { errorResult, okResult, Result } from '../../result';
import { toCreateResult } from '../helpers/to-create-result';
import { OpaqueValue } from '../opaque-value';

export class DateOnlyValue extends OpaqueValue<DateOnly> {
  protected static validate(
    value: string | null | undefined,
  ): Result<DateOnly | null, CodedDomainError> {
    const base = super.validate(value, 'INVALID_DATE_ONLY');
    if (!base.ok) {
      return base;
    }
    const raw = base.value;
    if (raw === null) {
      return okResult(null);
    }
    if (typeof raw !== 'string') {
      return errorResult([
        new CodedDomainError(
          'DateOnlyValue requires a YYYY-MM-DD string',
          'value',
          'INVALID_DATE_ONLY',
        ),
      ]);
    }
    return DateOnlyValue.parse(() => DateOnly.fromISODate(raw), 'INVALID_DATE_ONLY');
  }

  static create(value: string | null | undefined): Result<DateOnlyValue, CodedDomainError> {
    return toCreateResult(DateOnlyValue.validate(value), (v) => new DateOnlyValue(v));
  }

  // Same constraint as DateTimeValue: DateOnly's constructor is private, so
  // reconstitute() has no bypass and still calls the one throwing factory -
  // trusts persisted data without re-validating, matching every other
  // reconstitute() in this codebase.
  static reconstitute(value: string | null): DateOnlyValue {
    return new DateOnlyValue(DateOnlyValue.mapNullable(value, DateOnly.fromISODate));
  }

  public toJSON(): string | null {
    return DateOnlyValue.mapNullable(this.value, (value) => value.toISODate());
  }
}
