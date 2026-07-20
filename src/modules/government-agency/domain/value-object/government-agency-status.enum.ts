export const GOVERNMENT_AGENCY_STATUSES = ['ACTIVE', 'INACTIVE'] as const;

export type GovernmentAgencyStatusType = (typeof GOVERNMENT_AGENCY_STATUSES)[number];
