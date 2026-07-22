import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateGovernmentAgencyRequestDto } from '../create-government-agency.request.dto';

async function validateDto(payload: object) {
  const dto = plainToInstance(CreateGovernmentAgencyRequestDto, payload);
  return validate(dto);
}

describe('CreateGovernmentAgencyRequestDto', () => {
  it('accepts a valid name and status with foundedAt/annualBudget omitted', async () => {
    const errors = await validateDto({ name: 'Ministry of Health', status: 'ACTIVE' });

    expect(errors).toHaveLength(0);
  });

  it('accepts a valid foundedAt and annualBudget', async () => {
    const errors = await validateDto({
      name: 'Ministry of Health',
      status: 'ACTIVE',
      foundedAt: '1990-01-01',
      annualBudget: '150000.50',
    });

    expect(errors).toHaveLength(0);
  });

  it('accepts an explicit null foundedAt/annualBudget the same as omitting them', async () => {
    const errors = await validateDto({
      name: 'Ministry of Health',
      status: 'ACTIVE',
      foundedAt: null,
      annualBudget: null,
    });

    expect(errors).toHaveLength(0);
  });

  it('rejects a malformed foundedAt/annualBudget', async () => {
    const errors = await validateDto({
      name: 'Ministry of Health',
      status: 'ACTIVE',
      foundedAt: 'not-a-date',
      annualBudget: 'not-a-number',
    });

    expect(errors.some((error) => error.property === 'foundedAt')).toBe(true);
    expect(errors.some((error) => error.property === 'annualBudget')).toBe(true);
  });
});
