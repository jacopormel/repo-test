import { QueryValidationDefinition } from '@src/common';

export const governmentAgencyFindByQueryDefinition: QueryValidationDefinition = {
  selectableFields: {
    'government-agencies': 'id,name',
  },
  sortableFields: ['id', 'name'],
  filterableFields: ['id', 'name'],
  includableRelations: [],
};
