import { DateOnlyValue, DateTimeValue, DecimalValue } from '..';
import type { CodedDomainError } from '../../../error';
import type { Result } from '../../../result';

function unwrap<T>(result: Result<T, CodedDomainError>): T {
  if (!result.ok) {
    throw new Error(`Expected an ok result, got errors: ${JSON.stringify(result.errors)}`);
  }
  return result.value;
}

describe('DecimalValue', () => {
  it('accepts a numeric string and exposes it at serialization boundaries', () => {
    const value = unwrap(DecimalValue.create('150000.50'));
    expect(value.toJSON()).toBe('150000.5');
  });

  it('round-trips through toJSON/create', () => {
    const created = unwrap(DecimalValue.create('42.75'));
    const roundTripped = unwrap(DecimalValue.create(created.toJSON()));
    expect(roundTripped.equals(created)).toBe(true);
  });

  it('rejects a non-numeric string instead of letting Decimal throw', () => {
    expect(DecimalValue.create('not-a-number').ok).toBe(false);
  });

  it('rejects a non-string value', () => {
    expect(DecimalValue.create(42 as unknown as string).ok).toBe(false);
  });

  it('rejects undefined', () => {
    expect(DecimalValue.create(undefined).ok).toBe(false);
  });

  it('accepts null', () => {
    expect(unwrap(DecimalValue.create(null)).value).toBeNull();
  });

  it('reconstitutes without validating, throwing on corrupted persisted data', () => {
    expect(() => DecimalValue.reconstitute('not-a-number')).toThrow();
  });
});

describe('DateOnlyValue', () => {
  it('accepts a YYYY-MM-DD string and exposes it at serialization boundaries', () => {
    const value = unwrap(DateOnlyValue.create('1990-01-01'));
    expect(value.toJSON()).toBe('1990-01-01');
  });

  it('rejects a malformed date string instead of letting DateOnly throw', () => {
    expect(DateOnlyValue.create('not-a-date').ok).toBe(false);
  });

  it('rejects undefined', () => {
    expect(DateOnlyValue.create(undefined).ok).toBe(false);
  });

  it('accepts null', () => {
    expect(unwrap(DateOnlyValue.create(null)).value).toBeNull();
  });

  it('reconstitutes without validating, throwing on corrupted persisted data', () => {
    expect(() => DateOnlyValue.reconstitute('not-a-date')).toThrow();
  });
});

describe('DateTimeValue', () => {
  it('accepts a valid ISO 8601 string and round-trips through toJSON/create', () => {
    const created = unwrap(DateTimeValue.create('2024-01-01T00:00:00.000Z'));
    const roundTripped = unwrap(DateTimeValue.create(created.toJSON()));
    expect(roundTripped.equals(created)).toBe(true);
  });

  it('rejects a malformed ISO string instead of letting DateTime throw', () => {
    expect(DateTimeValue.create('not-a-date').ok).toBe(false);
  });

  it('rejects undefined', () => {
    expect(DateTimeValue.create(undefined).ok).toBe(false);
  });

  it('accepts null', () => {
    expect(unwrap(DateTimeValue.create(null)).value).toBeNull();
  });

  it('now() builds the current instant without going through create()', () => {
    expect(DateTimeValue.now().value).not.toBeNull();
  });

  it('reconstitutes without validating, throwing on corrupted persisted data', () => {
    expect(() => DateTimeValue.reconstitute('not-a-date')).toThrow();
  });
});
