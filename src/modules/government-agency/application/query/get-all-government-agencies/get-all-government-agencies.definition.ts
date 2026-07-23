import { QueryValidationDefinition } from '@src/common';

export const governmentAgencyFindByQueryDefinition: QueryValidationDefinition = {
  selectableFields: {
    'government-agencies': 'id,name,status,foundedAt,annualBudget',
  },
  sortableFields: ['id', 'name', 'status', 'foundedAt', 'annualBudget'],
  filterableFields: ['id', 'name', 'status', 'foundedAt', 'annualBudget'],
  includableRelations: [],
};
