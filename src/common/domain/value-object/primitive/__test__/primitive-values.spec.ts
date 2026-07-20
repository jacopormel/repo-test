import { BooleanValue, EnumValue, IntValue, NumberValue, StringValue } from '..';
import type { CodedDomainError } from '../../../error';
import type { Result } from '../../../result';

const SAMPLE_STATUSES = ['ACTIVE', 'INACTIVE'] as const;

class SampleStatusValue extends EnumValue<typeof SAMPLE_STATUSES> {
  static create(value: string): Result<SampleStatusValue, CodedDomainError> {
    return SampleStatusValue.validate(value, SAMPLE_STATUSES, (v) => new SampleStatusValue(v));
  }

  static reconstitute(value: string): SampleStatusValue {
    return new SampleStatusValue(value as (typeof SAMPLE_STATUSES)[number]);
  }
}

const SAMPLE_PRIORITIES = [1, 2, 3] as const;

class SamplePriorityValue extends EnumValue<typeof SAMPLE_PRIORITIES> {
  static create(value: number): Result<SamplePriorityValue, CodedDomainError> {
    return SamplePriorityValue.validate(value, SAMPLE_PRIORITIES, (v) => new SamplePriorityValue(v));
  }

  static reconstitute(value: number): SamplePriorityValue {
    return new SamplePriorityValue(value as (typeof SAMPLE_PRIORITIES)[number]);
  }
}

function unwrap<T>(result: Result<T, CodedDomainError>): T {
  if (!result.ok) {
    throw new Error(`Expected an ok result, got errors: ${JSON.stringify(result.errors)}`);
  }
  return result.value;
}

describe('StringValue', () => {
  it('compares values structurally through Axis ValueObject', () => {
    expect(unwrap(StringValue.create('axis')).equals(unwrap(StringValue.create('axis')))).toBe(
      true,
    );
    expect(unwrap(StringValue.create('axis')).equals(unwrap(StringValue.create('other')))).toBe(
      false,
    );
  });

  it('rejects non-string values', () => {
    expect(StringValue.create(123 as any).ok).toBe(false);
  });

  it('rejects undefined', () => {
    expect(StringValue.create(undefined).ok).toBe(false);
  });

  it('accepts null', () => {
    expect(unwrap(StringValue.create(null)).value).toBe(null);
  });

  it('reconstitutes without validating', () => {
    expect(StringValue.reconstitute('anything').value).toBe('anything');
  });
});

describe('IntValue', () => {
  it('accepts a safe integer and exposes it at serialization boundaries', () => {
    const value = unwrap(IntValue.create(42));
    expect(value.value).toBe(42);
    expect(value.valueOf()).toBe(42);
    expect(value.toJSON()).toBe(42);
    expect(value.toString()).toBe('42');
  });

  it('rejects non-integer decimals and unsafe integers', () => {
    expect(IntValue.create(1.5).ok).toBe(false);
    expect(IntValue.create(Number.MAX_SAFE_INTEGER + 1).ok).toBe(false);
  });

  it('rejects undefined', () => {
    expect(IntValue.create(undefined).ok).toBe(false);
  });

  it('accepts null', () => {
    expect(unwrap(IntValue.create(null)).value).toBe(null);
  });

  it('reconstitutes without validating', () => {
    expect(IntValue.reconstitute(1.5).value).toBe(1.5);
  });
});

describe('NumberValue', () => {
  it('accepts a finite number', () => {
    expect(unwrap(NumberValue.create(10.5)).value).toBe(10.5);
  });

  it('rejects NaN, Infinity and non-number values', () => {
    expect(NumberValue.create(Number.NaN).ok).toBe(false);
    expect(NumberValue.create(Number.POSITIVE_INFINITY).ok).toBe(false);
    expect(NumberValue.create('10' as any).ok).toBe(false);
  });

  it('rejects undefined', () => {
    expect(NumberValue.create(undefined).ok).toBe(false);
  });

  it('accepts null', () => {
    expect(unwrap(NumberValue.create(null)).value).toBe(null);
  });

  it('reconstitutes without validating', () => {
    expect(NumberValue.reconstitute(Number.NaN).value).toBe(Number.NaN);
  });
});

describe('BooleanValue', () => {
  it('accepts true and false', () => {
    expect(unwrap(BooleanValue.create(true)).value).toBe(true);
    expect(unwrap(BooleanValue.create(false)).value).toBe(false);
  });

  it('rejects non-boolean values', () => {
    expect(BooleanValue.create('true' as any).ok).toBe(false);
    expect(BooleanValue.create(0 as any).ok).toBe(false);
  });

  it('rejects undefined', () => {
    expect(BooleanValue.create(undefined).ok).toBe(false);
  });

  it('accepts null', () => {
    expect(unwrap(BooleanValue.create(null)).value).toBe(null);
  });

  it('reconstitutes without validating', () => {
    expect(BooleanValue.reconstitute(true).value).toBe(true);
  });
});

describe('EnumValue', () => {
  describe('with a string enum', () => {
    it('accepts values that belong to the declared set', () => {
      expect(unwrap(SampleStatusValue.create('ACTIVE')).value).toBe('ACTIVE');
    });

    it('rejects values outside the declared set', () => {
      expect(SampleStatusValue.create('DELETED').ok).toBe(false);
    });

    it('rejects undefined with a clean Result instead of throwing', () => {
      expect(SampleStatusValue.create(undefined as unknown as string).ok).toBe(false);
    });

    it('accepts null by default', () => {
      expect(unwrap(SampleStatusValue.create(null as unknown as string)).value).toBe(null);
    });

    it('reconstitutes without validating', () => {
      expect(SampleStatusValue.reconstitute('INACTIVE').value).toBe('INACTIVE');
    });
  });

  describe('with a number enum', () => {
    it('accepts values that belong to the declared set', () => {
      expect(unwrap(SamplePriorityValue.create(2)).value).toBe(2);
    });

    it('rejects values outside the declared set', () => {
      expect(SamplePriorityValue.create(9).ok).toBe(false);
    });

    it('reconstitutes without validating', () => {
      expect(SamplePriorityValue.reconstitute(2).value).toBe(2);
    });
  });
});
