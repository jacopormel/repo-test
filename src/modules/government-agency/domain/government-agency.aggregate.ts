import {
  AggregateRoot,
  CodedDomainError,
  DateTime,
  errorResult,
  Id,
  okResult,
  Result,
  unwrapResult,
  ValidatedPatchBuilder,
} from '@src/common';
import { GovernmentAgencyAlreadyDeletedError } from './error/government-agency-already-deleted.error';
import { GovernmentAgencyName } from './value-object/government-agency-name.value';
import { GovernmentAgencyStatus } from './value-object/government-agency-status.value';

interface GovernmentAgencyProps {
  name: GovernmentAgencyName;
  status: GovernmentAgencyStatus;
  deletedAt?: DateTime;
}

type GovernmentAgencyPatch = Pick<GovernmentAgencyProps, 'name' | 'status'>;

export class GovernmentAgency extends AggregateRoot<Id> {
  private readonly props: GovernmentAgencyProps;

  private constructor(id: Id, props: GovernmentAgencyProps) {
    super(id);
    this.props = props;
  }

  static create(input: {
    name: string;
    status?: string;
  }): Result<GovernmentAgency, CodedDomainError> {
    const errors: CodedDomainError[] = [];
    const name = unwrapResult(GovernmentAgencyName.create(input.name), errors);
    const status = unwrapResult(GovernmentAgencyStatus.create(input.status ?? null), errors);

    if (name === undefined || status === undefined) {
      return errorResult(errors);
    }

    return okResult(new GovernmentAgency(Id.create(), { name, status }));
  }

  static reconstitute(
    id: string,
    props: { name: string; status: string; deletedAt?: DateTime },
  ): GovernmentAgency {
    return new GovernmentAgency(Id.reconstitute(id), {
      name: GovernmentAgencyName.reconstitute(props.name),
      status: GovernmentAgencyStatus.reconstitute(props.status),
      deletedAt: props.deletedAt,
    });
  }

  update(changes: { name?: string; status?: string }): Result<void, CodedDomainError> {
    if (this.isDeleted()) {
      return errorResult([new GovernmentAgencyAlreadyDeletedError()]);
    }

    const patchResult = new ValidatedPatchBuilder<GovernmentAgencyPatch, CodedDomainError>()
      .add('name', changes.name, GovernmentAgencyName.create)
      .add('status', changes.status, GovernmentAgencyStatus.create)
      .toResult();

    if (!patchResult.ok) {
      return errorResult(patchResult.errors);
    }

    if (patchResult.value.name !== undefined) {
      this.props.name = patchResult.value.name;
    }
    if (patchResult.value.status !== undefined) {
      this.props.status = patchResult.value.status;
    }

    return okResult(undefined);
  }

  markAsDeleted(): Result<void, CodedDomainError> {
    if (this.isDeleted()) {
      return errorResult([new GovernmentAgencyAlreadyDeletedError()]);
    }

    this.props.deletedAt = DateTime.now();
    return okResult(undefined);
  }

  isDeleted(): boolean {
    return this.props.deletedAt !== undefined && this.props.deletedAt !== null;
  }

  get name(): GovernmentAgencyName {
    return this.props.name;
  }

  get status(): GovernmentAgencyStatus {
    return this.props.status;
  }

  get deletedAt(): DateTime | undefined {
    return this.props.deletedAt;
  }
}
