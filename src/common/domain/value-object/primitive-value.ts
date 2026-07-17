import { ValueObject } from '@pormeldev/axis-ddd-core';

export type Primitive = string | number | boolean;

type PrimitiveValueProps<T extends Primitive> = { value: T };

export abstract class PrimitiveValue<T extends Primitive> extends ValueObject<
  PrimitiveValueProps<T>
> {
  protected constructor(value: T) {
    super({ value });
  }

  public get value(): T {
    return this.props.value;
  }

  public valueOf(): T {
    return this.value;
  }

  public toJSON(): T {
    return this.value;
  }

  public toString(): string {
    return String(this.value);
  }
}
