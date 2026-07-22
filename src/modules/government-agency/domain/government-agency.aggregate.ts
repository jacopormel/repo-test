import {
  AggregateRoot,
  CodedDomainError,
  errorResult,
  Id,
  okResult,
  Result,
  unwrapResult,
  ValidatedPatchBuilder,
} from '@src/common/domain';
import { GovernmentAgencyAlreadyDeletedError } from './error/government-agency-already-deleted.error';
import { GovernmentAgencyAnnualBudget } from './value-object/government-agency-annual-budget.value';
import { GovernmentAgencyDeletedAt } from './value-object/government-agency-deleted-at.value';
import { GovernmentAgencyFoundedAt } from './value-object/government-agency-founded-at.value';
import { GovernmentAgencyName } from './value-object/government-agency-name.value';
import { GovernmentAgencyStatus } from './value-object/government-agency-status.value';

interface GovernmentAgencyProps {
  name: GovernmentAgencyName;
  status: GovernmentAgencyStatus;
  deletedAt: GovernmentAgencyDeletedAt;
  foundedAt: GovernmentAgencyFoundedAt;
  annualBudget: GovernmentAgencyAnnualBudget;
}

type GovernmentAgencyPatch = Pick<
  GovernmentAgencyProps,
  'name' | 'status' | 'foundedAt' | 'annualBudget'
>;

export class GovernmentAgency extends AggregateRoot<Id> {
  private readonly props: GovernmentAgencyProps;

  private constructor(id: Id, props: GovernmentAgencyProps) {
    super(id);
    this.props = props;
  }

  static create(input: {
    name: string;
    status: string;
    foundedAt?: string;
    annualBudget?: string;
  }): Result<GovernmentAgency, CodedDomainError> {
    const errors: CodedDomainError[] = [];
    const name = unwrapResult(GovernmentAgencyName.create(input.name), errors);
    const status = unwrapResult(GovernmentAgencyStatus.create(input.status), errors);
    const foundedAt = unwrapResult(
      GovernmentAgencyFoundedAt.create(input.foundedAt ?? null),
      errors,
    );
    const annualBudget = unwrapResult(
      GovernmentAgencyAnnualBudget.create(input.annualBudget ?? null),
      errors,
    );

    if (
      name === undefined ||
      status === undefined ||
      foundedAt === undefined ||
      annualBudget === undefined ||
      errors.length > 0
    ) {
      return errorResult(errors);
    }

    return okResult(
      new GovernmentAgency(Id.create(), {
        name,
        status,
        deletedAt: GovernmentAgencyDeletedAt.reconstitute(null),
        foundedAt,
        annualBudget,
      }),
    );
  }

  static reconstitute(
    id: string,
    props: {
      name: string;
      status: string;
      deletedAt?: string;
      foundedAt?: string;
      annualBudget?: string;
    },
  ): GovernmentAgency {
    return new GovernmentAgency(Id.reconstitute(id), {
      name: GovernmentAgencyName.reconstitute(props.name),
      status: GovernmentAgencyStatus.reconstitute(props.status),
      deletedAt: GovernmentAgencyDeletedAt.reconstitute(props.deletedAt ?? null),
      foundedAt: GovernmentAgencyFoundedAt.reconstitute(props.foundedAt ?? null),
      annualBudget: GovernmentAgencyAnnualBudget.reconstitute(props.annualBudget ?? null),
    });
  }

  update(changes: {
    name?: string;
    status?: string;
    foundedAt?: string;
    annualBudget?: string;
  }): Result<void, CodedDomainError> {
    if (this.isDeleted()) {
      return errorResult([new GovernmentAgencyAlreadyDeletedError()]);
    }

    const patchResult = new ValidatedPatchBuilder<GovernmentAgencyPatch, CodedDomainError>()
      .add('name', changes.name, GovernmentAgencyName.create)
      .add('status', changes.status, GovernmentAgencyStatus.create)
      .add('foundedAt', changes.foundedAt, GovernmentAgencyFoundedAt.create)
      .add('annualBudget', changes.annualBudget, GovernmentAgencyAnnualBudget.create)
      .toResult();

    if (!patchResult.ok) {
      return errorResult(patchResult.errors);
    }

    Object.assign(this.props, patchResult.value);

    return okResult(undefined);
  }

  markAsDeleted(): Result<void, CodedDomainError> {
    if (this.isDeleted()) {
      return errorResult([new GovernmentAgencyAlreadyDeletedError()]);
    }

    this.props.deletedAt = GovernmentAgencyDeletedAt.now();
    return okResult(undefined);
  }

  isDeleted(): boolean {
    return this.props.deletedAt.value !== null;
  }

  get name(): GovernmentAgencyName {
    return this.props.name;
  }

  get status(): GovernmentAgencyStatus {
    return this.props.status;
  }

  get deletedAt(): GovernmentAgencyDeletedAt {
    return this.props.deletedAt;
  }

  get foundedAt(): GovernmentAgencyFoundedAt {
    return this.props.foundedAt;
  }

  get annualBudget(): GovernmentAgencyAnnualBudget {
    return this.props.annualBudget;
  }
}
