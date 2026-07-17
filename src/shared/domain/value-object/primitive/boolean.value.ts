import { PrimitiveValue } from '../../primitive-value';

export class BooleanValue extends PrimitiveValue<boolean> {
  public constructor(value: boolean) {
    if (typeof value !== 'boolean') {
      throw new TypeError('BooleanValue requires a boolean');
    }
    super(value);
  }
}
