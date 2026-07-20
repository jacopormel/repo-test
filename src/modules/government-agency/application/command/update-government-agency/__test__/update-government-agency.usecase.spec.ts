import { Id, okResult } from '@src/common';
import { GovernmentAgency } from '@src/modules/government-agency/domain/government-agency.aggregate';
import { GovernmentAgencyNotFoundError } from '../../../error/government-agency-not-found.error';
import { GovernmentAgencyRepositoryPort } from '../../../port/out/government-agency-repository.port';
import { UpdateGovernmentAgencyUsecase } from '../update-government-agency.usecase';

function createRepositoryMock(): jest.Mocked<GovernmentAgencyRepositoryPort> {
  return {
    save: jest.fn(),
    patch: jest.fn(),
    findById: jest.fn(),
  };
}

function createAgency(): GovernmentAgency {
  const result = GovernmentAgency.create({ name: 'Ministry of Health' });
  if (!result.ok) {
    throw new Error('expected a valid agency');
  }
  return result.value;
}

describe('UpdateGovernmentAgencyUsecase', () => {
  it('updates the agency name and patches the repository', async () => {
    const repository = createRepositoryMock();
    const agency = createAgency();
    repository.findById.mockResolvedValue(okResult(agency));
    repository.patch.mockResolvedValue(okResult(undefined));
    const usecase = new UpdateGovernmentAgencyUsecase(repository);

    const result = await usecase.execute(agency.getId(), { name: 'Ministry of Education' });

    expect(result.ok).toBe(true);
    expect(agency.name.value).toBe('Ministry of Education');
    expect(repository.patch).toHaveBeenCalledWith(agency);
  });

  it('returns not-found without patching when the agency does not exist', async () => {
    const repository = createRepositoryMock();
    const notFoundError = new GovernmentAgencyNotFoundError('not found');
    repository.findById.mockResolvedValue({ ok: false, errors: [notFoundError] });
    const usecase = new UpdateGovernmentAgencyUsecase(repository);

    const result = await usecase.execute(Id.create(), { name: 'Ministry of Education' });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors).toContain(notFoundError);
    }
    expect(repository.patch).not.toHaveBeenCalled();
  });

  it('does not patch when the new name is invalid', async () => {
    const repository = createRepositoryMock();
    const agency = createAgency();
    repository.findById.mockResolvedValue(okResult(agency));
    const usecase = new UpdateGovernmentAgencyUsecase(repository);

    const result = await usecase.execute(agency.getId(), { name: 'short' });

    expect(result.ok).toBe(false);
    expect(repository.patch).not.toHaveBeenCalled();
  });

  it('does not patch when the agency is already deleted', async () => {
    const repository = createRepositoryMock();
    const agency = createAgency();
    agency.markAsDeleted();
    repository.findById.mockResolvedValue(okResult(agency));
    const usecase = new UpdateGovernmentAgencyUsecase(repository);

    const result = await usecase.execute(agency.getId(), { name: 'Ministry of Education' });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors[0].code).toBe('GOVERNMENT_AGENCY_ALREADY_DELETED');
    }
    expect(repository.patch).not.toHaveBeenCalled();
  });
});
