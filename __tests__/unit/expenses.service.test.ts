import {
  calculateBalance,
  validateAmount,
  validateType,
  formatCurrency,
  groupByCategory,
} from '../../src/expenses/expenses.service';

describe('Expenses Service – pure functions', () => {

  describe('calculateBalance', () => {
    it('returns income minus expenses', () => {
      expect(calculateBalance(3000, 1200)).toBeCloseTo(1800);
    });

    it('returns negative balance when expenses exceed income', () => {
      expect(calculateBalance(500, 900)).toBeCloseTo(-400);
    });

    it('returns 0 when balanced', () => {
      expect(calculateBalance(750, 750)).toBe(0);
    });
  });

  describe('validateAmount', () => {
    it('accepts positive numbers', () => {
      expect(validateAmount(1)).toBe(true);
      expect(validateAmount(0.01)).toBe(true);
      expect(validateAmount(99999.99)).toBe(true);
    });

    it('rejects zero', () => {
      expect(validateAmount(0)).toBe(false);
    });

    it('rejects negative numbers', () => {
      expect(validateAmount(-10)).toBe(false);
    });

    it('rejects Infinity and NaN', () => {
      expect(validateAmount(Infinity)).toBe(false);
      expect(validateAmount(NaN)).toBe(false);
    });
  });

  describe('validateType', () => {
    it('accepts "income" and "expense"', () => {
      expect(validateType('income')).toBe(true);
      expect(validateType('expense')).toBe(true);
    });

    it('rejects other strings', () => {
      expect(validateType('transfer')).toBe(false);
      expect(validateType('Income')).toBe(false);
      expect(validateType('')).toBe(false);
    });
  });

  describe('formatCurrency', () => {
    it('formats a number as AUD currency', () => {
      const result = formatCurrency(1234.5);
      expect(result).toContain('1,234.50');
    });
  });

  describe('groupByCategory', () => {
    it('sums amounts by category', () => {
      const entries = [
        { category: 'Food', amount: 50, type: 'expense' },
        { category: 'Food', amount: 30, type: 'expense' },
        { category: 'Transport', amount: 20, type: 'expense' },
      ];
      const result = groupByCategory(entries);
      expect(result['Food']).toBe(80);
      expect(result['Transport']).toBe(20);
    });

    it('returns empty object for empty input', () => {
      expect(groupByCategory([])).toEqual({});
    });
  });
});
