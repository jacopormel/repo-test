import { DateTime } from '@src/common/domain';
import { GovernmentAgency } from '../government-agency.aggregate';

function createValidAgency(): GovernmentAgency {
  const result = GovernmentAgency.create({ name: 'Ministry of Health', status: 'ACTIVE' });
  if (!result.ok) {
    throw new Error('expected a valid agency');
  }
  return result.value;
}

describe('GovernmentAgency', () => {
  describe('create', () => {
    it('creates an agency with the given name and status and no deletedAt', () => {
      const result = GovernmentAgency.create({
        name: 'Ministry of Health',
        status: 'ACTIVE',
      });

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.name.value).toBe('Ministry of Health');
        expect(result.value.status.value).toBe('ACTIVE');
        expect(result.value.status.isActive()).toBe(true);
        expect(result.value.isDeleted()).toBe(false);
        expect(result.value.deletedAt).toBeUndefined();
      }
    });

    it('creates an agency with an explicit INACTIVE status', () => {
      const result = GovernmentAgency.create({ name: 'Ministry of Health', status: 'INACTIVE' });

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.status.value).toBe('INACTIVE');
        expect(result.value.status.isActive()).toBe(false);
      }
    });

    it('rejects an invalid name', () => {
      const result = GovernmentAgency.create({ name: 'short', status: 'ACTIVE' });

      expect(result.ok).toBe(false);
    });

    it('rejects an invalid status', () => {
      const result = GovernmentAgency.create({ name: 'Ministry of Health', status: 'DELETED' });

      expect(result.ok).toBe(false);
    });

    it('rejects a status that violates the string contract at runtime (non-TS caller)', () => {
      const result = GovernmentAgency.create({
        name: 'Ministry of Health',
        status: undefined as unknown as string,
      });

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.errors[0].code).toBe('INVALID_ENUM_VALUE');
      }
    });

    it('accumulates errors from both name and status instead of stopping at the first one', () => {
      const result = GovernmentAgency.create({ name: 'short', status: 'DELETED' });

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.errors).toHaveLength(2);
        expect(result.errors.map((error) => error.code)).toEqual(
          expect.arrayContaining(['AGENCY_NAME_TOO_SHORT', 'INVALID_ENUM_VALUE']),
        );
      }
    });
  });

  describe('reconstitute', () => {
    it('restores id, name, status and deletedAt without validating', () => {
      const deletedAt = DateTime.now();
      const agency = GovernmentAgency.reconstitute('short', {
        name: 'short',
        status: 'INACTIVE',
        deletedAt,
      });

      expect(agency.name.value).toBe('short');
      expect(agency.status.value).toBe('INACTIVE');
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

    it('applies a valid status change', () => {
      const agency = createValidAgency();

      const result = agency.update({ status: 'INACTIVE' });

      expect(result.ok).toBe(true);
      expect(agency.status.value).toBe('INACTIVE');
      expect(agency.status.isActive()).toBe(false);
    });

    it('rejects an invalid status and leaves the aggregate unchanged', () => {
      const agency = createValidAgency();

      const result = agency.update({ status: 'DELETED' });

      expect(result.ok).toBe(false);
      expect(agency.status.value).toBe('ACTIVE');
    });

    it('does not apply valid fields when another field is invalid', () => {
      const agency = createValidAgency();

      const result = agency.update({
        name: 'Ministry of Education',
        status: 'DELETED',
      });

      expect(result.ok).toBe(false);
      expect(agency.name.value).toBe('Ministry of Health');
      expect(agency.status.value).toBe('ACTIVE');
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
