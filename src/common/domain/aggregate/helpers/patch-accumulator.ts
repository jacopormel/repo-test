import { errorResult, okResult, Result } from '../../result';
import { ValueObject } from '../../value-object';

/**
 * Reduces the boilerplate of a multi-field aggregate `update()`: for each
 * field present in the incoming patch, build it through its own VO
 * `create()` (or any `(raw) => Result<Value, Error>` factory) and only
 * assign it if valid, without ever skipping validation or writing to `props`
 * directly. Missing fields (`undefined`) are left untouched (PATCH semantics).
 *
 * Scales to aggregates with many fields without one hand-written method per
 * field: each field becomes a single `apply(...)` call inside one `update()`.
 */
export class PatchAccumulator<TError> {
  private readonly errors: TError[] = [];

  apply<TRaw, TValue extends ValueObject<Record<string, unknown>>>(
    rawValue: TRaw | undefined,
    create: (value: TRaw) => Result<TValue, TError>,
    assign: (value: TValue) => void,
  ): void {
    if (rawValue === undefined) {
      return;
    }

    const result = create(rawValue);
    if (!result.ok) {
      this.errors.push(...result.errors);
      return;
    }

    assign(result.value);
  }

  toResult(): Result<void, TError> {
    return this.errors.length > 0 ? errorResult(this.errors) : okResult(undefined);
  }
}
