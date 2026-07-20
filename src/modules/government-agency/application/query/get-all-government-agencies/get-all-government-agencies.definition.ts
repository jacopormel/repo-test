import { QueryValidationDefinition } from '@src/common';

export const governmentAgencyFindByQueryDefinition: QueryValidationDefinition = {
  selectableFields: {
    'government-agencies': 'id,name,status',
  },
  sortableFields: ['id', 'name', 'status'],
  filterableFields: ['id', 'name', 'status'],
  includableRelations: [],
};
