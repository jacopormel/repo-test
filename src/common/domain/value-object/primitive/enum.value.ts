import { CodedDomainError } from '../../error';
import { okResult, Result } from '../../result';
import { createEnumValue } from '../helpers/create-enum-value';
import { PrimitiveValue } from '../primitive-value';

export abstract class EnumValue<
  TValues extends readonly (string | number)[],
> extends PrimitiveValue<TValues[number]> {
  protected static validate<
    TValues extends readonly (string | number)[],
    TVO extends EnumValue<TValues>,
  >(
    value: string | number | undefined | null,
    allowedValues: TValues,
    construct: (value: TValues[number] | null) => TVO,
  ): Result<TVO, CodedDomainError> {
    return createEnumValue(value, allowedValues, (v) => okResult(construct(v)));
  }
}
