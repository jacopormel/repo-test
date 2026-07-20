import {
  BadRequestException,
  HttpException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CodedDomainError } from '@src/common';
import { CodedApplicationNotFoundError } from '@src/common/application/error';
import { CodedInfrastructureError } from '@src/common/infrastructure/error';
import { GovernmentAgencyMappingError } from '../../../application/error/government-agency-mapping.error';
import { GovernmentAgencyNotFoundError } from '../../../application/error/government-agency-not-found.error';

export function mapGovernmentAgencyErrorsToHttpException(
  errors: (CodedDomainError | GovernmentAgencyMappingError | GovernmentAgencyNotFoundError)[],
): HttpException {
  if (errors.some((error) => error instanceof CodedApplicationNotFoundError)) {
    return new NotFoundException(errors);
  }
  if (errors.length > 0 && errors.every((error) => error instanceof CodedDomainError)) {
    return new BadRequestException(errors);
  }
  return new InternalServerErrorException(errors);
}

export function mapGovernmentAgencyQueryErrorsToHttpException(
  errors: (CodedInfrastructureError | GovernmentAgencyMappingError)[],
): HttpException {
  if (errors.length > 0 && errors.every((error) => error instanceof CodedInfrastructureError)) {
    return new BadRequestException(errors);
  }
  return new InternalServerErrorException(errors);
}
