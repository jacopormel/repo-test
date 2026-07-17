import { PrimitiveValue } from '../../primitive-value';

export class StringValue extends PrimitiveValue<string> {
  public constructor(value: string) {
    if (typeof value !== 'string') {
      throw new TypeError('StringValue requires a string');
    }
    super(value);
  }
}
