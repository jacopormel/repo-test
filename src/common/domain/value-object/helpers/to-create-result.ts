import { CodedDomainError } from '../../error';
import { errorResult, okResult, Result } from '../../result';

export function toCreateResult<TValue, TInstance>(
  validated: Result<TValue, CodedDomainError>,
  build: (value: TValue) => TInstance,
): Result<TInstance, CodedDomainError> {
  if (!validated.ok) {
    return errorResult(validated.errors);
  }
  return okResult(build(validated.value));
}
