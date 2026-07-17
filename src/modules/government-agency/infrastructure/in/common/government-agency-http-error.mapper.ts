import {
  BadRequestException,
  HttpException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CodedDomainError } from '@src/common';
import { CodedApplicationNotFoundError } from '@src/common/application/error';
import { GovernmentAgencyMappingError } from '../../../application/error/government-agency-mapping.error';
import { GovernmentAgencyNotFoundError } from '../../../application/error/government-agency-not-found.error';

/**
 * Shared across create/update/delete controllers. `instanceof` must target the
 * Axis base classes (CodedApplicationNotFoundError, CodedDomainError), not our
 * own subclasses: axis-common-lib's Coded*Error constructors reset `this`'s
 * prototype to their own class, so subclass `instanceof` checks always fail.
 * See AGENTS.md (root of Proyectos/) for the verified gotcha.
 */
export function mapGovernmentAgencyErrorsToHttpException(
  errors: (CodedDomainError | GovernmentAgencyMappingError | GovernmentAgencyNotFoundError)[],
): HttpException {
  if (errors.some((error) => error instanceof CodedApplicationNotFoundError)) {
    return new NotFoundException(errors);
  }
  if (errors.every((error) => error instanceof CodedDomainError)) {
    return new BadRequestException(errors);
  }
  return new InternalServerErrorException(errors);
}
