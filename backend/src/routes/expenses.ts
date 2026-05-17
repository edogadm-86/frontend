import express from 'express';
import {
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
  getExpenseStats,
  getYearlyStats,
} from '../controllers/expenseController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

router.use(authenticateToken);

router.get('/dog/:dogId', getExpenses);
router.get('/dog/:dogId/stats', getExpenseStats);
router.get('/dog/:dogId/yearly', getYearlyStats);
router.post('/dog/:dogId', createExpense);
router.put('/dog/:dogId/:id', updateExpense);
router.delete('/dog/:dogId/:id', deleteExpense);

export default router;
