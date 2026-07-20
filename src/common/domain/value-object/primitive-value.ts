import { ValueObject } from '@pormeldev/axis-ddd-core';

export type Primitive = string | number | boolean;

type PrimitiveValueProps<T extends Primitive> = { value: T | null };

export abstract class PrimitiveValue<T extends Primitive> extends ValueObject<
  PrimitiveValueProps<T>
> {
  protected constructor(value: T | null) {
    super({ value });
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
