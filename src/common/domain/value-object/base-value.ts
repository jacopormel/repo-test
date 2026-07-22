import { ValueObject } from '@pormeldev/axis-ddd-core';
import { CodedDomainError } from '../error';
import { errorResult, okResult, Result } from '../result';

type BaseValueProps<T> = { value: T | null };

export abstract class BaseValue<T> extends ValueObject<BaseValueProps<T>> {
  protected constructor(value: T | null) {
    super({ value });
  }

  protected static validate(value: unknown, code: string): Result<unknown, CodedDomainError> {
    if (value === undefined) {
      return errorResult([new CodedDomainError('Value cannot be undefined', 'value', code)]);
    }
    return okResult(value);
  }

  public get value(): T | null {
    return this.props.value;
  }

  public valueOf(): T | null {
    return this.value;
  }

  public toString(): string {
    return String(this.value);
  }
}
