import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { list, create, update, remove, summary } from './expenses.controller';

export const expensesRouter = Router();

expensesRouter.use(authMiddleware);

expensesRouter.get('/',         list);
expensesRouter.post('/',        create);
expensesRouter.put('/:id',      update);
expensesRouter.delete('/:id',   remove);
expensesRouter.get('/summary',  summary);
