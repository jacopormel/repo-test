import { CacheInterface, Id, okResult } from '@src/common';
import { GovernmentAgency } from '@src/modules/government-agency/domain/government-agency.aggregate';
import { GovernmentAgencyNotFoundError } from '../../../error/government-agency-not-found.error';
import { GovernmentAgencyRepositoryPort } from '../../../port/out/government-agency-repository.port';
import { DeleteGovernmentAgencyUsecase } from '../delete-government-agency.usecase';

function createRepositoryMock(): jest.Mocked<GovernmentAgencyRepositoryPort> {
  return {
    save: jest.fn(),
    patch: jest.fn(),
    findById: jest.fn(),
  };
}

function createCacheMock(): jest.Mocked<CacheInterface> {
  const cache = {
    get: jest.fn(),
    getMany: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
    deleteMany: jest.fn(),
    expire: jest.fn(),
    addToSet: jest.fn(),
    deleteFromSet: jest.fn(),
    getSetMembers: jest.fn(),
    scan: jest.fn(),
  };
  cache.scan.mockResolvedValue(okResult([]));
  return cache;
}

function createAgency(): GovernmentAgency {
  const result = GovernmentAgency.create({ name: 'Ministry of Health', status: 'ACTIVE' });
  if (!result.ok) {
    throw new Error('expected a valid agency');
  }
  return result.value;
}

describe('DeleteGovernmentAgencyUsecase', () => {
  it('soft-deletes the agency, patches the repository, and invalidates the list cache', async () => {
    const repository = createRepositoryMock();
    const cache = createCacheMock();
    const agency = createAgency();
    repository.findById.mockResolvedValue(okResult(agency));
    repository.patch.mockResolvedValue(okResult(undefined));
    const usecase = new DeleteGovernmentAgencyUsecase(repository, cache);

    const result = await usecase.execute(agency.getId().toString());

    expect(result.ok).toBe(true);
    expect(agency.isDeleted()).toBe(true);
    expect(repository.patch).toHaveBeenCalledWith(agency);
    expect(cache.scan).toHaveBeenCalledTimes(1);
  });

  it('returns not-found without patching or invalidating the cache when the agency does not exist', async () => {
    const repository = createRepositoryMock();
    const cache = createCacheMock();
    const notFoundError = new GovernmentAgencyNotFoundError('not found');
    repository.findById.mockResolvedValue({ ok: false, errors: [notFoundError] });
    const usecase = new DeleteGovernmentAgencyUsecase(repository, cache);

    const result = await usecase.execute(Id.create().toString());

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors).toContain(notFoundError);
    }
    expect(repository.patch).not.toHaveBeenCalled();
    expect(cache.scan).not.toHaveBeenCalled();
  });

  it('does not patch or invalidate the cache when the agency is already deleted', async () => {
    const repository = createRepositoryMock();
    const cache = createCacheMock();
    const agency = createAgency();
    agency.markAsDeleted();
    repository.findById.mockResolvedValue(okResult(agency));
    const usecase = new DeleteGovernmentAgencyUsecase(repository, cache);

    const result = await usecase.execute(agency.getId().toString());

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors[0].code).toBe('GOVERNMENT_AGENCY_ALREADY_DELETED');
    }
    expect(repository.patch).not.toHaveBeenCalled();
    expect(cache.scan).not.toHaveBeenCalled();
  });
});
