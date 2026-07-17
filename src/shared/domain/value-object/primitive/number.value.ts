import { PrimitiveValue } from '../../primitive-value';

export class NumberValue extends PrimitiveValue<number> {
  public constructor(value: number) {
    if (typeof value !== 'number' || !Number.isFinite(value)) {
      throw new TypeError('NumberValue requires a finite number');
    }
    super(value);
  }
}
