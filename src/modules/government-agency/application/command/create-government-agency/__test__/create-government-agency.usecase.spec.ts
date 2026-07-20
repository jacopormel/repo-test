import { Id, okResult, Result } from '@src/common';
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

describe('CreateGovernmentAgencyUsecase', () => {
  it('saves a newly created agency and returns its id', async () => {
    const repository = createRepositoryMock();
    const savedId = Id.create();
    repository.save.mockResolvedValue(okResult(savedId) as Result<Id, GovernmentAgencyMappingError>);
    const usecase = new CreateGovernmentAgencyUsecase(repository);

    const result = await usecase.execute({ name: 'Ministry of Health' });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe(savedId);
    }
    expect(repository.save).toHaveBeenCalledTimes(1);
    const savedAgency = repository.save.mock.calls[0][0] as GovernmentAgency;
    expect(savedAgency.name.value).toBe('Ministry of Health');
  });

  it('does not call the repository when the name is invalid', async () => {
    const repository = createRepositoryMock();
    const usecase = new CreateGovernmentAgencyUsecase(repository);

    const result = await usecase.execute({ name: 'short' });

    expect(result.ok).toBe(false);
    expect(repository.save).not.toHaveBeenCalled();
  });

  it('propagates a repository failure', async () => {
    const repository = createRepositoryMock();
    const mappingError = new GovernmentAgencyMappingError('mapping failed');
    repository.save.mockResolvedValue({ ok: false, errors: [mappingError] });
    const usecase = new CreateGovernmentAgencyUsecase(repository);

    const result = await usecase.execute({ name: 'Ministry of Health' });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors).toContain(mappingError);
    }
  });
});
