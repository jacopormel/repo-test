import { ValueObject } from '@pormeldev/axis-ddd-core';
import { CodedDomainError } from '../error';
import { errorResult, okResult, Result } from '../result';

export type Primitive = string | number | boolean;

type PrimitiveValueProps<T extends Primitive> = { value: T | null };

export abstract class PrimitiveValue<T extends Primitive> extends ValueObject<
  PrimitiveValueProps<T>
> {
  protected constructor(value: T | null) {
    super({ value });
  }

  // `unknown`, not a `<TValue>` generic: a generic here makes subclasses'
  // validate() trip TS2417 ("static side incorrectly extends base class
  // static side") when they narrow it to a concrete type.
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

  public toJSON(): T | null {
    return this.value;
  }

  public toString(): string {
    return String(this.value);
  }
}
