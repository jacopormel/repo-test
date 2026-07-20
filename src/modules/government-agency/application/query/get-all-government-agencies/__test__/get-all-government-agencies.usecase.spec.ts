import { okPagedResult, QueryDto } from '@src/common';
import { GovernmentAgencyDto } from '../../../dto/government-agency.dto';
import { GovernmentAgencyQueryPort } from '../../../port/out/government-agency-query.port';
import { GetAllGovernmentAgenciesUsecase } from '../get-all-government-agencies.usecase';

function createQueryPortMock(): jest.Mocked<GovernmentAgencyQueryPort> {
  return { findAll: jest.fn() };
}

function createValidQuery(): QueryDto {
  const result = QueryDto.create();
  if (!result.ok) {
    throw new Error('expected a valid query');
  }
  return result.value;
}

describe('GetAllGovernmentAgenciesUsecase', () => {
  it('delegates to the query port and returns its paged result', async () => {
    const queryPort = createQueryPortMock();
    const agencies = [new GovernmentAgencyDto('id-1', 'Ministry of Health')];
    queryPort.findAll.mockResolvedValue(
      okPagedResult(agencies, { pageNumber: 1, pageSize: 10, totalRecords: 1, totalPages: 1 }),
    );
    const usecase = new GetAllGovernmentAgenciesUsecase(queryPort);
    const query = createValidQuery();

    const result = await usecase.execute(query);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe(agencies);
    }
    expect(queryPort.findAll).toHaveBeenCalledWith(query);
  });

  it('returns a validation error and skips the query port when the query is invalid', async () => {
    const queryPort = createQueryPortMock();
    const usecase = new GetAllGovernmentAgenciesUsecase(queryPort);
    const query = createValidQuery();
    jest.spyOn(query, 'hasErrors').mockReturnValue(true);
    jest.spyOn(query, 'getErrors').mockReturnValue([]);

    const result = await usecase.execute(query);

    expect(result.ok).toBe(false);
    expect(queryPort.findAll).not.toHaveBeenCalled();
  });
});
