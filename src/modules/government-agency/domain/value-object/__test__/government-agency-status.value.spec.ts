import { GovernmentAgencyStatus } from '../government-agency-status.value';

describe('GovernmentAgencyStatus', () => {
  describe('create', () => {
    it('accepts a value from the declared set and exposes it', () => {
      const result = GovernmentAgencyStatus.create('ACTIVE');

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.value).toBe('ACTIVE');
        expect(result.value.isActive()).toBe(true);
      }
    });

    it('rejects a value outside the declared set', () => {
      const result = GovernmentAgencyStatus.create('DELETED');

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.errors[0].code).toBe('INVALID_ENUM_VALUE');
      }
    });

    it('rejects undefined with a clean Result instead of throwing', () => {
      const result = GovernmentAgencyStatus.create(undefined as unknown as string);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.errors[0].code).toBe('INVALID_ENUM_VALUE');
      }
    });

    it('rejects null even though the base EnumValue allows it, because status is required', () => {
      const result = GovernmentAgencyStatus.create(null);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.errors[0].code).toBe('INVALID_ENUM_VALUE');
      }
    });
  });

  describe('reconstitute', () => {
    it('does NOT re-run any validation', () => {
      const status = GovernmentAgencyStatus.reconstitute('INACTIVE');

      expect(status.value).toBe('INACTIVE');
      expect(status.isActive()).toBe(false);
    });
  });
});
