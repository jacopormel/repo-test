import { CodedDomainError } from '../../error';
import { errorResult, Result } from '../../result';
import { PrimitiveValue } from '../primitive-value';

export function createEnumValue<
  TPrimitive extends string | number,
  TVO extends PrimitiveValue<TPrimitive>,
>(
  value: TPrimitive,
  allowedValues: readonly TPrimitive[],
  create: (value: TPrimitive) => Result<TVO, CodedDomainError>,
): Result<TVO, CodedDomainError> {
  if (!allowedValues.includes(value)) {
    return errorResult([
      new CodedDomainError(
        `Invalid enum value "${String(value)}". Allowed values: ${allowedValues.join(', ')}`,
        'value',
        'INVALID_ENUM_VALUE',
      ),
    ]);
  }
  return create(value);
}
