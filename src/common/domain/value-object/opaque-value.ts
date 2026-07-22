import { CodedDomainError } from '../error';
import { errorResult, okResult, Result } from '../result';
import { BaseValue } from './base-value';

// Adapter for value types from a package we don't control that don't follow our
// create()/reconstitute() convention - e.g. Decimal's constructor is public and
// throws on bad input instead of returning a Result. parse() turns that throwing
// construction into the Result shape every local VO already expects, so a
// subclass's validate() can call it exactly like PrimitiveValue subclasses call
// super.validate(). Not a PrimitiveValue<T> subclass because Primitive is
// constrained to string | number | boolean and typeof-checked; these types need
// try/catch instead.
export abstract class OpaqueValue<T> extends BaseValue<T> {
  protected static parse<TValue>(
    build: () => TValue,
    code: string,
  ): Result<TValue, CodedDomainError> {
    try {
      return okResult(build());
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Invalid value';
      return errorResult([new CodedDomainError(message, 'value', code)]);
    }
  }

  // reconstitute() never validates, so there's no failure case to report - just
  // the same "pass null through, build otherwise" every reconstitute() here needs.
  protected static mapNullable<TRaw, TValue>(
    value: TRaw | null,
    build: (value: TRaw) => TValue,
  ): TValue | null {
    return value === null ? null : build(value);
  }
}
