import { GovernmentAgencyName } from '../government-agency-name.value';

describe('GovernmentAgencyName', () => {
  describe('create', () => {
    it('rejects names shorter than 10 characters', () => {
      const result = GovernmentAgencyName.create('Corto');

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0].code).toBe('AGENCY_NAME_TOO_SHORT');
        expect(result.errors[0].field).toBe('name');
      }
    });

    it('rejects a name that is exactly 9 characters (boundary)', () => {
      const result = GovernmentAgencyName.create('123456789');

      expect(result.ok).toBe(false);
    });

    it('accepts a name that is exactly 10 characters (boundary)', () => {
      const result = GovernmentAgencyName.create('1234567890');

      expect(result.ok).toBe(true);
    });

    it('accepts a valid name and exposes its value', () => {
      const result = GovernmentAgencyName.create('Ministry of Health');

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.value).toBe('Ministry of Health');
      }
    });

    it('rejects non-string values at the underlying StringValue guard', () => {
      const result = GovernmentAgencyName.create(42 as any);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.errors[0].code).toBe('INVALID_STRING');
      }
    });

    it('rejects null even though the base StringValue allows it, because name is required', () => {
      const result = GovernmentAgencyName.create(null as unknown as string);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.errors[0].code).toBe('AGENCY_NAME_REQUIRED');
      }
    });
  });

  describe('reconstitute', () => {
    it('does NOT re-run any validation, including the base type guard', () => {
      // reconstitute() is only called by mappers reading trusted data back
      // from persistence — everything under this template validates through
      // Result, and reconstitute is explicitly the path that skips it, so
      // that already-persisted rows stay readable even if a rule tightened
      // after they were written.
      const name = GovernmentAgencyName.reconstitute('short');

      expect(name.value).toBe('short');
    });
  });
});
