import { errorResult, okResult, Result, unwrapResult } from '../../result';

export class ValidatedPatchBuilder<TPatch extends object, TError> {
  private readonly errors: TError[] = [];
  private readonly values: Partial<TPatch> = {};

  add<TKey extends keyof TPatch, TRaw>(
    key: TKey,
    rawValue: TRaw | undefined,
    create: (value: TRaw) => Result<TPatch[TKey], TError>,
  ): this {
    if (rawValue === undefined) {
      return this;
    }

    const value = unwrapResult(create(rawValue), this.errors);
    if (value !== undefined) {
      this.values[key] = value;
    }

    return this;
  }

  toResult(): Result<Partial<TPatch>, TError> {
    return this.errors.length > 0 ? errorResult(this.errors) : okResult(this.values);
  }
}
