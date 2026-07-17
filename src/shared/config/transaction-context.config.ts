import { EntityManager } from "typeorm";
import {
  RepositoryToken,
  TransactionRegistryConfig,
} from "@pormeldev/axis-service-database";

export function configureTransactionContext(
  manager: EntityManager,
): TransactionRegistryConfig {
  return new Map<RepositoryToken<any>, any>([
  ]);
}
