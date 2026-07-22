import { errorResult, okResult, Result, unwrapResult } from '../../result';

export class ValidatedCreateBuilder<TProps extends object, TError> {
  private readonly errors: TError[] = [];
  private readonly values: Partial<TProps> = {};
  private missingRequiredValue = false;

  add<TKey extends keyof TProps, TRaw>(
    key: TKey,
    rawValue: TRaw,
    create: (value: TRaw) => Result<TProps[TKey], TError>,
  ): this {
    const value = unwrapResult(create(rawValue), this.errors);
    if (value === undefined) {
      this.missingRequiredValue = true;
      return this;
    }

    this.values[key] = value;
    return this;
  }

  toResult(): Result<TProps, TError> {
    if (this.missingRequiredValue || this.errors.length > 0) {
      return errorResult(this.errors);
    }
    return okResult(this.values as TProps);
  }
}
