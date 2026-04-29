import { pool } from '../db';

export interface ExpenseInput {
  title: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: string;
  note?: string;
}

// ── Pure utility functions (unit-testable) ────────────────

export function calculateBalance(totalIncome: number, totalExpenses: number): number {
  return Number(totalIncome) - Number(totalExpenses);
}

export function validateAmount(amount: number): boolean {
  return typeof amount === 'number' && amount > 0 && isFinite(amount);
}

export function validateType(type: string): type is 'income' | 'expense' {
  return type === 'income' || type === 'expense';
}

export function formatCurrency(amount: number, currency = 'AUD'): string {
  return new Intl.NumberFormat('en-AU', { style: 'currency', currency }).format(amount);
}

export function groupByCategory(entries: { category: string; amount: number; type: string }[]) {
  return entries.reduce<Record<string, number>>((acc, entry) => {
    acc[entry.category] = (acc[entry.category] || 0) + Number(entry.amount);
    return acc;
  }, {});
}

// ── DB-dependent functions ────────────────────────────────

export async function getExpenses(userId: number) {
  const result = await pool.query(
    'SELECT * FROM expenses WHERE user_id = $1 ORDER BY date DESC, created_at DESC',
    [userId]
  );
  return result.rows;
}

export async function createExpense(userId: number, data: ExpenseInput) {
  const { title, amount, type, category, date, note } = data;
  const result = await pool.query(
    `INSERT INTO expenses (user_id, title, amount, type, category, date, note)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
    [userId, title, amount, type, category, date, note || null]
  );
  return result.rows[0];
}

export async function updateExpense(id: number, userId: number, data: Partial<ExpenseInput>) {
  const allowed = ['title', 'amount', 'type', 'category', 'date', 'note'];
  const fields: string[] = [];
  const values: unknown[] = [];
  let idx = 1;

  for (const key of allowed) {
    if (data[key as keyof ExpenseInput] !== undefined) {
      fields.push(`${key} = $${idx}`);
      values.push(data[key as keyof ExpenseInput]);
      idx++;
    }
  }
  if (fields.length === 0) throw new Error('No fields to update');

  values.push(id, userId);
  const result = await pool.query(
    `UPDATE expenses SET ${fields.join(', ')}
     WHERE id = $${idx} AND user_id = $${idx + 1} RETURNING *`,
    values
  );
  if (result.rows.length === 0) throw new Error('Expense not found or not yours');
  return result.rows[0];
}

export async function deleteExpense(id: number, userId: number) {
  const result = await pool.query(
    'DELETE FROM expenses WHERE id = $1 AND user_id = $2 RETURNING id',
    [id, userId]
  );
  if (result.rows.length === 0) throw new Error('Expense not found or not yours');
  return true;
}

export async function getSummary(userId: number) {
  const byCategory = await pool.query(
    `SELECT type, category, SUM(amount)::float AS total, COUNT(*)::int AS count
     FROM expenses WHERE user_id = $1
     GROUP BY type, category ORDER BY type, total DESC`,
    [userId]
  );
  const totals = await pool.query(
    `SELECT
       COALESCE(SUM(CASE WHEN type='income'  THEN amount END), 0)::float AS total_income,
       COALESCE(SUM(CASE WHEN type='expense' THEN amount END), 0)::float AS total_expenses
     FROM expenses WHERE user_id = $1`,
    [userId]
  );
  const { total_income, total_expenses } = totals.rows[0];
  return {
    byCategory: byCategory.rows,
    totalIncome: total_income,
    totalExpenses: total_expenses,
    balance: calculateBalance(total_income, total_expenses),
  };
}
