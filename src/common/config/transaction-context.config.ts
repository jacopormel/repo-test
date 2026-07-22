import {
  RepositoryFactory,
  RepositoryToken,
  TransactionRegistryConfig,
} from '@pormeldev/axis-service-database';
import { EntityManager } from 'typeorm';

export function configureTransactionContext(_manager: EntityManager): TransactionRegistryConfig {
  return new Map<RepositoryToken<unknown>, RepositoryFactory<unknown>>([]);
}
