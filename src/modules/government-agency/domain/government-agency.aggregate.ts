import {
  AggregateRoot,
  CodedDomainError,
  DateTime,
  errorResult,
  Id,
  okResult,
  PatchAccumulator,
  Result,
} from '@src/common';
import { GovernmentAgencyAlreadyDeletedError } from './error/government-agency-already-deleted.error';
import { GovernmentAgencyName } from './value-object/government-agency-name.value';

interface GovernmentAgencyProps {
  name: GovernmentAgencyName;
  deletedAt?: DateTime;
}

export class GovernmentAgency extends AggregateRoot<Id> {
  private readonly props: GovernmentAgencyProps;

  private constructor(id: Id, props: GovernmentAgencyProps) {
    super(id);
    this.props = props;
  }

  static create(input: { name: string }): Result<GovernmentAgency, CodedDomainError> {
    const nameResult = GovernmentAgencyName.create(input.name);
    if (!nameResult.ok) {
      return errorResult(nameResult.errors);
    }

    return okResult(new GovernmentAgency(Id.create(), { name: nameResult.value }));
  }

  static reconstitute(id: string, props: { name: string; deletedAt?: DateTime }): GovernmentAgency {
    return new GovernmentAgency(Id.reconstitute(id), {
      name: GovernmentAgencyName.reconstitute(props.name),
      deletedAt: props.deletedAt,
    });
  }

  update(changes: { name?: string }): Result<void, CodedDomainError> {
    if (this.isDeleted()) {
      return errorResult([new GovernmentAgencyAlreadyDeletedError()]);
    }

    const patch = new PatchAccumulator<CodedDomainError>();

    patch.apply(changes.name, GovernmentAgencyName.create, (value) => {
      this.props.name = value;
    });

    return patch.toResult();
  }

  markAsDeleted(): Result<void, CodedDomainError> {
    if (this.isDeleted()) {
      return errorResult([new GovernmentAgencyAlreadyDeletedError()]);
    }

    this.props.deletedAt = DateTime.now();
    return okResult(undefined);
  }

  isDeleted(): boolean {
    return this.props.deletedAt !== undefined;
  }

  get name(): GovernmentAgencyName {
    return this.props.name;
  }

  get deletedAt(): DateTime | undefined {
    return this.props.deletedAt;
  }
}
