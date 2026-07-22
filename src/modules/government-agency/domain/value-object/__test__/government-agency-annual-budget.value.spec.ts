import { GovernmentAgencyAnnualBudget } from '../government-agency-annual-budget.value';

describe('GovernmentAgencyAnnualBudget', () => {
  describe('create', () => {
    it('accepts a positive budget', () => {
      const result = GovernmentAgencyAnnualBudget.create('150000.50');

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.toJSON()).toBe('150000.5');
      }
    });

    it('accepts zero (boundary)', () => {
      const result = GovernmentAgencyAnnualBudget.create('0');

      expect(result.ok).toBe(true);
    });

    it('rejects a negative budget', () => {
      const result = GovernmentAgencyAnnualBudget.create('-500000');

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0].code).toBe('AGENCY_ANNUAL_BUDGET_NEGATIVE');
        expect(result.errors[0].field).toBe('annualBudget');
      }
    });

    it('accepts null (budget is optional)', () => {
      const result = GovernmentAgencyAnnualBudget.create(null);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.value).toBeNull();
      }
    });

    it('rejects undefined at the underlying DecimalValue guard', () => {
      const result = GovernmentAgencyAnnualBudget.create(undefined);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.errors[0].code).toBe('INVALID_DECIMAL');
      }
    });

    it('rejects a malformed numeric string instead of letting Decimal throw', () => {
      const result = GovernmentAgencyAnnualBudget.create('not-a-number');

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.errors[0].code).toBe('INVALID_DECIMAL');
      }
    });
  });

  describe('reconstitute', () => {
    it('does NOT re-run any validation, including the negative-budget rule', () => {
      // reconstitute() is only called by mappers reading trusted data back from
      // persistence, so a negative value that predates this rule stays readable.
      const budget = GovernmentAgencyAnnualBudget.reconstitute('-500000');

      expect(budget.value?.isNegative()).toBe(true);
    });

    it('accepts null', () => {
      const budget = GovernmentAgencyAnnualBudget.reconstitute(null);

      expect(budget.value).toBeNull();
    });
  });
});
