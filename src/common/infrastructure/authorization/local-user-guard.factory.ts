import { Reflector } from '@nestjs/core';
import { AxisUser } from '@pormeldev/axis-common-lib';
import { LocalUserGuard } from '@pormeldev/axis-nestjs-common';
import { DataSource } from 'typeorm';

function noopUserSync(_user: AxisUser, _id: number): void {
  // No-op: this template doesn't sync extra fields on local user insert/update.
}

export function createLocalUserGuard(dataSource: DataSource, reflector: Reflector): LocalUserGuard {
  return new LocalUserGuard(dataSource, reflector, noopUserSync, noopUserSync);
}
