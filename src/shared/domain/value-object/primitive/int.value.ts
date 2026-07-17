import { PrimitiveValue } from '../../primitive-value';

export class IntValue extends PrimitiveValue<number> {
  public constructor(value: number) {
    if (!Number.isSafeInteger(value)) {
      throw new TypeError('IntValue requires a safe integer');
    }
    super(value);
  }
}
