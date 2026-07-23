import { CacheInterface, Id, okResult, Result } from '@src/common';
import { GovernmentAgency } from '@src/modules/government-agency/domain/government-agency.aggregate';
import { GovernmentAgencyMappingError } from '../../../error/government-agency-mapping.error';
import { GovernmentAgencyRepositoryPort } from '../../../port/out/government-agency-repository.port';
import { CreateGovernmentAgencyUsecase } from '../create-government-agency.usecase';

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

describe('CreateGovernmentAgencyUsecase', () => {
  it('saves a newly created agency, invalidates the list cache, and returns its id', async () => {
    const repository = createRepositoryMock();
    const cache = createCacheMock();
    const savedId = Id.create();
    repository.save.mockResolvedValue(okResult(savedId) as Result<Id, GovernmentAgencyMappingError>);
    const usecase = new CreateGovernmentAgencyUsecase(repository, cache);

    const result = await usecase.execute({ name: 'Ministry of Health', status: 'ACTIVE' });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe(savedId.toString());
    }
    expect(repository.save).toHaveBeenCalledTimes(1);
    const savedAgency = repository.save.mock.calls[0][0] as GovernmentAgency;
    expect(savedAgency.name.value).toBe('Ministry of Health');
    expect(cache.scan).toHaveBeenCalledTimes(1);
  });

  it('does not call the repository or invalidate the cache when the name is invalid', async () => {
    const repository = createRepositoryMock();
    const cache = createCacheMock();
    const usecase = new CreateGovernmentAgencyUsecase(repository, cache);

    const result = await usecase.execute({ name: 'short', status: 'ACTIVE' });

    expect(result.ok).toBe(false);
    expect(repository.save).not.toHaveBeenCalled();
    expect(cache.scan).not.toHaveBeenCalled();
  });

  it('propagates a repository failure without invalidating the cache', async () => {
    const repository = createRepositoryMock();
    const cache = createCacheMock();
    const mappingError = new GovernmentAgencyMappingError('mapping failed');
    repository.save.mockResolvedValue({ ok: false, errors: [mappingError] });
    const usecase = new CreateGovernmentAgencyUsecase(repository, cache);

    const result = await usecase.execute({ name: 'Ministry of Health', status: 'ACTIVE' });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors).toContain(mappingError);
    }
    expect(cache.scan).not.toHaveBeenCalled();
  });
});
