import { GovernmentAgencyDeletedAt } from '../value-object/government-agency-deleted-at.value';
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
        expect(result.value.deletedAt.value).toBeNull();
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

    it('accepts a valid foundedAt and annualBudget', () => {
      const result = GovernmentAgency.create({
        name: 'Ministry of Health',
        status: 'ACTIVE',
        foundedAt: '1990-01-01',
        annualBudget: '150000.50',
      });

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.foundedAt.toJSON()).toBe('1990-01-01');
        expect(result.value.annualBudget.toJSON()).toBe('150000.5');
      }
    });

    it('leaves foundedAt/annualBudget empty (null) when not provided', () => {
      const result = GovernmentAgency.create({ name: 'Ministry of Health', status: 'ACTIVE' });

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.foundedAt.value).toBeNull();
        expect(result.value.annualBudget.value).toBeNull();
      }
    });

    it('rejects a malformed foundedAt/annualBudget instead of letting the underlying library throw', () => {
      const result = GovernmentAgency.create({
        name: 'Ministry of Health',
        status: 'ACTIVE',
        foundedAt: 'not-a-date',
        annualBudget: 'not-a-number',
      });

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.errors.map((error) => error.code)).toEqual(
          expect.arrayContaining(['INVALID_DATE_ONLY', 'INVALID_DECIMAL']),
        );
      }
    });

    it('rejects a negative annualBudget', () => {
      const result = GovernmentAgency.create({
        name: 'Ministry of Health',
        status: 'ACTIVE',
        annualBudget: '-500000',
      });

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.errors[0].code).toBe('AGENCY_ANNUAL_BUDGET_NEGATIVE');
      }
    });
  });

  describe('reconstitute', () => {
    it('restores id, name, status and deletedAt without validating', () => {
      const deletedAt = GovernmentAgencyDeletedAt.now();
      const agency = GovernmentAgency.reconstitute('short', {
        name: 'short',
        status: 'INACTIVE',
        deletedAt: deletedAt.toJSON()!,
      });

      expect(agency.name.value).toBe('short');
      expect(agency.status.value).toBe('INACTIVE');
      expect(agency.deletedAt.toJSON()).toBe(deletedAt.toJSON());
      expect(agency.isDeleted()).toBe(true);
    });

    it('restores foundedAt and annualBudget', () => {
      const agency = GovernmentAgency.reconstitute('short', {
        name: 'Ministry of Health',
        status: 'ACTIVE',
        foundedAt: '1990-01-01',
        annualBudget: '150000.50',
      });

      expect(agency.foundedAt.toJSON()).toBe('1990-01-01');
      expect(agency.annualBudget.toJSON()).toBe('150000.5');
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

    it('applies a valid foundedAt and annualBudget change', () => {
      const agency = createValidAgency();

      const result = agency.update({ foundedAt: '1990-01-01', annualBudget: '150000.50' });

      expect(result.ok).toBe(true);
      expect(agency.foundedAt.toJSON()).toBe('1990-01-01');
      expect(agency.annualBudget.toJSON()).toBe('150000.5');
    });

    it('rejects a malformed foundedAt/annualBudget and leaves the aggregate unchanged', () => {
      const agency = createValidAgency();

      const result = agency.update({ foundedAt: 'not-a-date', annualBudget: 'not-a-number' });

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.errors.map((error) => error.code)).toEqual(
          expect.arrayContaining(['INVALID_DATE_ONLY', 'INVALID_DECIMAL']),
        );
      }
      expect(agency.foundedAt.value).toBeNull();
      expect(agency.annualBudget.value).toBeNull();
    });

    it('rejects a negative annualBudget and leaves the aggregate unchanged', () => {
      const agency = createValidAgency();

      const result = agency.update({ annualBudget: '-500000' });

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.errors[0].code).toBe('AGENCY_ANNUAL_BUDGET_NEGATIVE');
      }
      expect(agency.annualBudget.value).toBeNull();
    });
  });

  describe('markAsDeleted', () => {
    it('marks the agency as deleted', () => {
      const agency = createValidAgency();

      const result = agency.markAsDeleted();

      expect(result.ok).toBe(true);
      expect(agency.isDeleted()).toBe(true);
      expect(agency.deletedAt).toBeInstanceOf(GovernmentAgencyDeletedAt);
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
