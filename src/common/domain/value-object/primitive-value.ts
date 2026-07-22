import { BaseValue } from './base-value';

export type Primitive = string | number | boolean;

export abstract class PrimitiveValue<T extends Primitive> extends BaseValue<T> {
  public toJSON(): T | null {
    return this.value;
  }
}
