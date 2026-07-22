import { CodedDomainError } from '../../error';
import { errorResult, okResult, Result } from '../../result';
import { isMember } from '../helpers/is-enum-member';
import { PrimitiveValue } from '../primitive-value';

export abstract class EnumValue<
  TValues extends readonly (string | number)[],
> extends PrimitiveValue<TValues[number]> {
  protected static validateEnum<TValues extends readonly (string | number)[]>(
    value: string | number | undefined | null,
    allowedValues: TValues,
  ): Result<TValues[number] | null, CodedDomainError> {
    if (value === undefined) {
      return errorResult([
        new CodedDomainError('Enum value cannot be undefined', 'value', 'INVALID_ENUM_VALUE'),
      ]);
    }
    if (value !== null && !isMember(value, allowedValues)) {
      return errorResult([
        new CodedDomainError(
          `Invalid enum value "${String(value)}". Allowed values: ${allowedValues.join(', ')}`,
          'value',
          'INVALID_ENUM_VALUE',
        ),
      ]);
    }
    return okResult(value);
  }
}
