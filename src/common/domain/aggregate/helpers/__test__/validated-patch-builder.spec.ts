import { errorResult, okResult, Result } from '../../../result';
import { ValidatedPatchBuilder } from '../validated-patch-builder';

interface SamplePatch {
  name: string;
  priority: number;
}

describe('ValidatedPatchBuilder', () => {
  it('returns all validated values without applying side effects', () => {
    const result = new ValidatedPatchBuilder<SamplePatch, string>()
      .add('name', 'Axis', (value): Result<string, string> => okResult(value.trim()))
      .add('priority', 1, (value): Result<number, string> => okResult(value))
      .toResult();

    expect(result).toEqual(okResult({ name: 'Axis', priority: 1 }));
  });

  it('accumulates errors from every provided field', () => {
    const result = new ValidatedPatchBuilder<SamplePatch, string>()
      .add('name', '', (): Result<string, string> => errorResult(['INVALID_NAME']))
      .add('priority', -1, (): Result<number, string> => errorResult(['INVALID_PRIORITY']))
      .toResult();

    expect(result).toEqual(errorResult(['INVALID_NAME', 'INVALID_PRIORITY']));
  });

  it('skips omitted fields', () => {
    const createName = jest.fn((value: string): Result<string, string> => okResult(value));

    const result = new ValidatedPatchBuilder<SamplePatch, string>()
      .add('name', undefined, createName)
      .toResult();

    expect(createName).not.toHaveBeenCalled();
    expect(result).toEqual(okResult({}));
  });

});
