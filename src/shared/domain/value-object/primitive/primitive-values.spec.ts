import { BooleanValue, IntValue, NumberValue, StringValue } from '.';
import { DateOnly, DateTime, Decimal, Id } from '../../data-type';

describe('primitive value objects', () => {
  it('compares values structurally through Axis ValueObject', () => {
    expect(new StringValue('axis').equals(new StringValue('axis'))).toBe(true);
    expect(new StringValue('axis').equals(new StringValue('other'))).toBe(
      false,
    );
  });

  it('exposes the wrapped primitive at serialization boundaries', () => {
    const value = new IntValue(42);
    expect(value.value).toBe(42);
    expect(value.valueOf()).toBe(42);
    expect(value.toJSON()).toBe(42);
    expect(value.toString()).toBe('42');
  });

  it('accepts valid primitive values', () => {
    expect(new NumberValue(10.5).value).toBe(10.5);
    expect(new BooleanValue(false).value).toBe(false);
  });

  it('rejects unsafe integers and non-finite numbers', () => {
    expect(() => new IntValue(1.5)).toThrow(TypeError);
    expect(() => new IntValue(Number.MAX_SAFE_INTEGER + 1)).toThrow(TypeError);
    expect(() => new NumberValue(Number.NaN)).toThrow(TypeError);
  });

  it('uses Axis types for decimals, dates and IDs', () => {
    expect(new Decimal('10.50').toString()).toBe('10.5');
    expect(DateOnly.fromISODate('2026-07-17').toISODate()).toBe('2026-07-17');
    expect(DateTime.fromISO('2026-07-17T12:00:00Z').hour).toBe(12);
    expect(Id.create().toString()).toMatch(/^[0-9a-f-]+$/i);
  });
});
