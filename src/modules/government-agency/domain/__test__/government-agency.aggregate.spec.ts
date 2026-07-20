import { DateTime } from '@src/common';
import { GovernmentAgency } from '../government-agency.aggregate';

function createValidAgency(): GovernmentAgency {
  const result = GovernmentAgency.create({ name: 'Ministry of Health' });
  if (!result.ok) {
    throw new Error('expected a valid agency');
  }
  return result.value;
}

describe('GovernmentAgency', () => {
  describe('create', () => {
    it('creates an agency with the given name and no deletedAt', () => {
      const result = GovernmentAgency.create({ name: 'Ministry of Health' });

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.name.value).toBe('Ministry of Health');
        expect(result.value.isDeleted()).toBe(false);
        expect(result.value.deletedAt).toBeUndefined();
      }
    });

    it('rejects an invalid name', () => {
      const result = GovernmentAgency.create({ name: 'short' });

      expect(result.ok).toBe(false);
    });
  });

  describe('reconstitute', () => {
    it('restores id, name and deletedAt without validating', () => {
      const deletedAt = DateTime.now();
      const agency = GovernmentAgency.reconstitute('short', { name: 'short', deletedAt });

      expect(agency.name.value).toBe('short');
      expect(agency.deletedAt).toBe(deletedAt);
      expect(agency.isDeleted()).toBe(true);
    });
  });

  describe('update', () => {
    it('applies a valid name change', () => {
      const agency = createValidAgency();

      const result = agency.update({ name: 'Ministry of Education' });

      expect(result.ok).toBe(true);
      expect(agency.name.value).toBe('Ministry of Education');
    });

    it('is a no-op when no fields are provided (PATCH semantics)', () => {
      const agency = createValidAgency();

      const result = agency.update({});

      expect(result.ok).toBe(true);
      expect(agency.name.value).toBe('Ministry of Health');
    });

    it('rejects an invalid name and leaves the aggregate unchanged', () => {
      const agency = createValidAgency();

      const result = agency.update({ name: 'short' });

      expect(result.ok).toBe(false);
      expect(agency.name.value).toBe('Ministry of Health');
    });

    it('refuses to update an already-deleted agency', () => {
      const agency = createValidAgency();
      agency.markAsDeleted();

      const result = agency.update({ name: 'Ministry of Education' });

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.errors[0].code).toBe('GOVERNMENT_AGENCY_ALREADY_DELETED');
      }
      expect(agency.name.value).toBe('Ministry of Health');
    });
  });

  describe('markAsDeleted', () => {
    it('marks the agency as deleted', () => {
      const agency = createValidAgency();

      const result = agency.markAsDeleted();

      expect(result.ok).toBe(true);
      expect(agency.isDeleted()).toBe(true);
      expect(agency.deletedAt).toBeInstanceOf(DateTime);
    });

    it('refuses to delete an already-deleted agency', () => {
      const agency = createValidAgency();
      agency.markAsDeleted();
      const firstDeletedAt = agency.deletedAt;

      const result = agency.markAsDeleted();

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.errors[0].code).toBe('GOVERNMENT_AGENCY_ALREADY_DELETED');
      }
      expect(agency.deletedAt).toBe(firstDeletedAt);
    });
  });
});
