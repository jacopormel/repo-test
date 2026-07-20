import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { UpdateGovernmentAgencyRequestDto } from '../update-government-agency.request.dto';

async function validateDto(payload: object) {
  const dto = plainToInstance(UpdateGovernmentAgencyRequestDto, payload);
  return validate(dto);
}

describe('UpdateGovernmentAgencyRequestDto', () => {
  it('accepts an empty body (PATCH semantics - both fields omitted)', async () => {
    expect(await validateDto({})).toHaveLength(0);
  });

  it('accepts a valid name and status', async () => {
    expect(await validateDto({ name: 'Ministry of Health', status: 'ACTIVE' })).toHaveLength(0);
  });

  it('rejects an explicit null name instead of silently skipping validation', async () => {
    const errors = await validateDto({ name: null });

    expect(errors).not.toHaveLength(0);
    expect(errors.some((error) => error.property === 'name')).toBe(true);
  });

  it('rejects an explicit null status instead of silently skipping validation', async () => {
    const errors = await validateDto({ status: null });

    expect(errors).not.toHaveLength(0);
    expect(errors.some((error) => error.property === 'status')).toBe(true);
  });

  it('still rejects a too-short name', async () => {
    const errors = await validateDto({ name: 'short' });

    expect(errors.some((error) => error.property === 'name')).toBe(true);
  });

  it('still rejects a status outside the declared set', async () => {
    const errors = await validateDto({ status: 'DELETED' });

    expect(errors.some((error) => error.property === 'status')).toBe(true);
  });
});
