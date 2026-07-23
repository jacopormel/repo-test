import { CacheInterface, okPagedResult, okResult, QueryDto } from '@src/common';
import { GovernmentAgencyDto } from '../../../dto/government-agency.dto';
import { GovernmentAgencyMappingError } from '../../../error/government-agency-mapping.error';
import { GovernmentAgencyQueryPort } from '../../../port/out/government-agency-query.port';
import { GetAllGovernmentAgenciesUsecase } from '../get-all-government-agencies.usecase';

function createQueryPortMock(): jest.Mocked<GovernmentAgencyQueryPort> {
  return { findAll: jest.fn() };
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
  cache.get.mockResolvedValue(okResult(null));
  cache.set.mockResolvedValue(okResult(undefined));
  return cache;
}

function createValidQuery(): QueryDto {
  const result = QueryDto.create();
  if (!result.ok) {
    throw new Error('expected a valid query');
  }
  return result.value;
}

describe('GetAllGovernmentAgenciesUsecase', () => {
  it('delegates to the query port and caches the result on a miss', async () => {
    const queryPort = createQueryPortMock();
    const cache = createCacheMock();
    const agencies = [new GovernmentAgencyDto('id-1', 'Ministry of Health', 'ACTIVE')];
    const pagedResult = okPagedResult<GovernmentAgencyDto[], GovernmentAgencyMappingError>(agencies, {
      pageNumber: 1,
      pageSize: 10,
      totalRecords: 1,
      totalPages: 1,
    });
    queryPort.findAll.mockResolvedValue(pagedResult);
    const usecase = new GetAllGovernmentAgenciesUsecase(queryPort, cache);
    const query = createValidQuery();

    const result = await usecase.execute(query);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe(agencies);
    }
    expect(queryPort.findAll).toHaveBeenCalledWith(query);
    expect(cache.set).toHaveBeenCalledWith(expect.any(String), pagedResult);
  });

  it('returns the cached result without calling the query port on a hit', async () => {
    const queryPort = createQueryPortMock();
    const cache = createCacheMock();
    const agencies = [new GovernmentAgencyDto('id-1', 'Ministry of Health', 'ACTIVE')];
    const cachedResult = okPagedResult(agencies, {
      pageNumber: 1,
      pageSize: 10,
      totalRecords: 1,
      totalPages: 1,
    });
    cache.get.mockResolvedValue(okResult(cachedResult));
    const usecase = new GetAllGovernmentAgenciesUsecase(queryPort, cache);
    const query = createValidQuery();

    const result = await usecase.execute(query);

    expect(result).toBe(cachedResult);
    expect(queryPort.findAll).not.toHaveBeenCalled();
    expect(cache.set).not.toHaveBeenCalled();
  });

  it('returns a validation error and skips the query port and cache when the query is invalid', async () => {
    const queryPort = createQueryPortMock();
    const cache = createCacheMock();
    const usecase = new GetAllGovernmentAgenciesUsecase(queryPort, cache);
    const query = createValidQuery();
    jest.spyOn(query, 'hasErrors').mockReturnValue(true);
    jest.spyOn(query, 'getErrors').mockReturnValue([]);

    const result = await usecase.execute(query);

    expect(result.ok).toBe(false);
    expect(queryPort.findAll).not.toHaveBeenCalled();
    expect(cache.get).not.toHaveBeenCalled();
  });
});
