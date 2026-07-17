import { BooleanValue, IntValue, NumberValue, StringValue } from '..';
import { createEnumValue } from '../../helpers/create-enum-value';
import type { CodedDomainError } from '../../../error';
import { errorResult, okResult, type Result } from '../../../result';

enum SampleStatus {
  Active = 'ACTIVE',
  Inactive = 'INACTIVE',
}

class SampleStatusValue extends StringValue {
  static create(value: string): Result<SampleStatusValue, CodedDomainError> {
    const result = createEnumValue(value, Object.values(SampleStatus), StringValue.create);
    if (!result.ok) {
      return errorResult(result.errors);
    }
    return okResult(new SampleStatusValue(value));
  }

  static reconstitute(value: string): SampleStatusValue {
    return new SampleStatusValue(value);
  }
}

function unwrap<T>(result: Result<T, CodedDomainError>): T {
  if (!result.ok) {
    throw new Error(`Expected an ok result, got errors: ${JSON.stringify(result.errors)}`);
  }
  return result.value;
}

describe('primitive value objects', () => {
  it('compares values structurally through Axis ValueObject', () => {
    expect(unwrap(StringValue.create('axis')).equals(unwrap(StringValue.create('axis')))).toBe(
      true,
    );
    expect(unwrap(StringValue.create('axis')).equals(unwrap(StringValue.create('other')))).toBe(
      false,
    );
  });

  it('exposes the wrapped primitive at serialization boundaries', () => {
    const value = unwrap(IntValue.create(42));
    expect(value.value).toBe(42);
    expect(value.valueOf()).toBe(42);
    expect(value.toJSON()).toBe(42);
    expect(value.toString()).toBe('42');
  });

  it('accepts valid primitive values', () => {
    expect(unwrap(NumberValue.create(10.5)).value).toBe(10.5);
    expect(unwrap(BooleanValue.create(false)).value).toBe(false);
  });

  it('rejects unsafe integers and non-finite numbers', () => {
    expect(IntValue.create(1.5).ok).toBe(false);
    expect(IntValue.create(Number.MAX_SAFE_INTEGER + 1).ok).toBe(false);
    expect(NumberValue.create(Number.NaN).ok).toBe(false);
  });

  it('rejects non-string values on StringValue at the type-guard level', () => {
    expect(StringValue.create(123 as any).ok).toBe(false);
    expect(StringValue.create(null as any).ok).toBe(false);
    expect(StringValue.create(undefined as any).ok).toBe(false);
  });

  it('accepts values that belong to the declared enum', () => {
    expect(unwrap(SampleStatusValue.create(SampleStatus.Active)).value).toBe('ACTIVE');
  });

  it('rejects values outside the declared enum', () => {
    expect(SampleStatusValue.create('DELETED' as any).ok).toBe(false);
  });
});
