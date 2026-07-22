import { QueryValidationDefinition } from '@src/common';

export const governmentAgencyFindByQueryDefinition: QueryValidationDefinition = {
  selectableFields: {
    'government-agencies': 'id,name,status,founded_at,annual_budget',
  },
  sortableFields: ['id', 'name', 'status'],
  filterableFields: ['id', 'name', 'status'],
  includableRelations: [],
};
