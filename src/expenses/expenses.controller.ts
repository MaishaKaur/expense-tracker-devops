import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import * as svc from './expenses.service';

export async function list(req: AuthRequest, res: Response) {
  try {
    const expenses = await svc.getExpenses(req.userId!);
    res.json(expenses);
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
}

export async function create(req: AuthRequest, res: Response) {
  try {
    const { title, amount, type, category, date, note } = req.body;
    if (!title || !amount || !type || !category || !date)
      return res.status(400).json({ error: 'title, amount, type, category and date are required' });
    if (!svc.validateAmount(Number(amount)))
      return res.status(400).json({ error: 'amount must be a positive number' });
    if (!svc.validateType(type))
      return res.status(400).json({ error: 'type must be income or expense' });
    const expense = await svc.createExpense(req.userId!, { title, amount: Number(amount), type, category, date, note });
    res.status(201).json(expense);
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
}

export async function update(req: AuthRequest, res: Response) {
  try {
    const expense = await svc.updateExpense(Number(req.params.id), req.userId!, req.body);
    res.json(expense);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Server error';
    res.status(400).json({ error: msg });
  }
}

export async function remove(req: AuthRequest, res: Response) {
  try {
    await svc.deleteExpense(Number(req.params.id), req.userId!);
    res.json({ message: 'Deleted' });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Server error';
    res.status(404).json({ error: msg });
  }
}

export async function summary(req: AuthRequest, res: Response) {
  try {
    const data = await svc.getSummary(req.userId!);
    res.json(data);
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
}
