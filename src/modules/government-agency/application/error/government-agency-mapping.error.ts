import { CodedApplicationError } from '@src/common/application/error';

export class GovernmentAgencyMappingError extends CodedApplicationError {
  constructor(message: string, field = 'governmentAgency') {
    super(message, field, 'GOVERNMENT_AGENCY_MAPPING_ERROR');
  }
}
