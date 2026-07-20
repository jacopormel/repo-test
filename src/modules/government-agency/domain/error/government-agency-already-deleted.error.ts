import { CodedDomainError } from '@src/common';

export class GovernmentAgencyAlreadyDeletedError extends CodedDomainError {
  constructor(message = 'Government agency is already deleted', field = 'id') {
    super(message, field, 'GOVERNMENT_AGENCY_ALREADY_DELETED');
  }
}
