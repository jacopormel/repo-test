import { CodedApplicationNotFoundError } from '@src/common/application/error';

export class GovernmentAgencyNotFoundError extends CodedApplicationNotFoundError {
  constructor(message: string, field = 'id') {
    super(message, field, 'GOVERNMENT_AGENCY_NOT_FOUND');
  }
}
