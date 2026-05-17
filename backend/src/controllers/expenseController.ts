import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import pool from '../config/database';
import { AuthRequest } from '../types';

export const getYearlyStats = async (req: AuthRequest, res: Response) => {
  try {
    const { dogId } = req.params;
    const { year } = req.query;

    if (!(await verifyDogOwnership(dogId, req.user!.id))) {
      return res.status(404).json({ error: 'Dog not found' });
    }

    const targetYear = parseInt((year as string) || String(new Date().getFullYear()));

    const [monthlyRes, categoryRes] = await Promise.all([
      pool.query(
        `SELECT
           EXTRACT(MONTH FROM date)::int AS month,
           COALESCE(SUM(amount), 0) AS total,
           COUNT(*) AS count
         FROM expenses
         WHERE dog_id = $1 AND EXTRACT(YEAR FROM date) = $2
         GROUP BY month ORDER BY month`,
        [dogId, targetYear]
      ),
      pool.query(
        `SELECT category, COALESCE(SUM(amount), 0) AS total FROM expenses
         WHERE dog_id = $1 AND EXTRACT(YEAR FROM date) = $2
         GROUP BY category ORDER BY total DESC`,
        [dogId, targetYear]
      ),
    ]);

    const monthlyData = monthlyRes.rows.map((r: any) => ({
      month: r.month,
      total: parseFloat(r.total),
      count: parseInt(r.count),
    }));

    res.json({
      year: targetYear,
      yearTotal: monthlyData.reduce((s, r) => s + r.total, 0),
      monthlyData,
      categoryBreakdown: categoryRes.rows.map((r: any) => ({
        category: r.category,
        total: parseFloat(r.total),
      })),
    });
  } catch (error) {
    console.error('Get yearly stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const verifyDogOwnership = async (dogId: string, userId: string) => {
  const result = await pool.query(
    'SELECT id FROM dogs WHERE id = $1 AND user_id = $2',
    [dogId, userId]
  );
  return result.rows.length > 0;
};

export const getExpenses = async (req: AuthRequest, res: Response) => {
  try {
    const { dogId } = req.params;
    const { month, year, limit } = req.query;

    if (!(await verifyDogOwnership(dogId, req.user!.id))) {
      return res.status(404).json({ error: 'Dog not found' });
    }

    // Auto-create recurring expenses for the current month on first load
    const nowMonth = new Date().toISOString().slice(0, 7);
    if (month && month === nowMonth) {
      const currentMonthStart = `${month}-01`;
      const templates = await pool.query(
        `SELECT * FROM expenses WHERE dog_id = $1 AND recur_monthly = true AND recur_source_id IS NULL`,
        [dogId]
      );
      for (const tpl of templates.rows) {
        const existing = await pool.query(
          `SELECT id FROM expenses WHERE dog_id = $1 AND recur_source_id = $2
           AND date >= $3::date AND date < ($3::date + INTERVAL '1 month')`,
          [dogId, tpl.id, currentMonthStart]
        );
        if (existing.rows.length === 0) {
          const newId = uuidv4();
          await pool.query(
            `INSERT INTO expenses (id, dog_id, user_id, date, category, description, vendor, amount, notes, recur_monthly, recur_source_id)
             VALUES ($1, $2, $3, $4::date, $5, $6, $7, $8, $9, false, $10)`,
            [newId, dogId, req.user!.id, currentMonthStart, tpl.category, tpl.description, tpl.vendor, tpl.amount, tpl.notes, tpl.id]
          );
        }
      }
    }

    const params: any[] = [dogId];
    let query = 'SELECT * FROM expenses WHERE dog_id = $1';

    if (month) {
      query += ` AND date >= $2::date AND date < ($2::date + INTERVAL '1 month')`;
      params.push(`${month}-01`);
    } else if (year) {
      params.push(parseInt(year as string));
      query += ` AND EXTRACT(YEAR FROM date) = $2`;
    }

    query += ' ORDER BY date DESC, created_at DESC';

    if (limit) {
      params.push(parseInt(limit as string));
      query += ` LIMIT $${params.length}`;
    }

    const result = await pool.query(query, params);
    res.json({ expenses: result.rows });
  } catch (error) {
    console.error('Get expenses error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createExpense = async (req: AuthRequest, res: Response) => {
  try {
    const { dogId } = req.params;
    const { date, category, description, vendor, amount, notes, recur_monthly, receipt_photo } = req.body;

    if (!(await verifyDogOwnership(dogId, req.user!.id))) {
      return res.status(404).json({ error: 'Dog not found' });
    }

    const id = uuidv4();
    const result = await pool.query(
      `INSERT INTO expenses (id, dog_id, user_id, date, category, description, vendor, amount, notes, recur_monthly, receipt_photo)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
      [id, dogId, req.user!.id, date, category, description, vendor || null, amount, notes || null, recur_monthly || false, receipt_photo || null]
    );

    res.status(201).json({ expense: result.rows[0] });
  } catch (error) {
    console.error('Create expense error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateExpense = async (req: AuthRequest, res: Response) => {
  try {
    const { dogId, id } = req.params;
    const { date, category, description, vendor, amount, notes, recur_monthly, receipt_photo } = req.body;

    if (!(await verifyDogOwnership(dogId, req.user!.id))) {
      return res.status(404).json({ error: 'Dog not found' });
    }

    const result = await pool.query(
      `UPDATE expenses
       SET date = $1, category = $2, description = $3, vendor = $4, amount = $5, notes = $6,
           recur_monthly = $7, receipt_photo = $8, updated_at = NOW()
       WHERE id = $9 AND dog_id = $10 RETURNING *`,
      [date, category, description, vendor || null, amount, notes || null, recur_monthly || false, receipt_photo || null, id, dogId]
    );

    if (result.rows.length === 0) return res.status(404).json({ error: 'Expense not found' });
    res.json({ expense: result.rows[0] });
  } catch (error) {
    console.error('Update expense error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteExpense = async (req: AuthRequest, res: Response) => {
  try {
    const { dogId, id } = req.params;

    if (!(await verifyDogOwnership(dogId, req.user!.id))) {
      return res.status(404).json({ error: 'Dog not found' });
    }

    const result = await pool.query(
      'DELETE FROM expenses WHERE id = $1 AND dog_id = $2 RETURNING id',
      [id, dogId]
    );

    if (result.rows.length === 0) return res.status(404).json({ error: 'Expense not found' });
    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    console.error('Delete expense error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getExpenseStats = async (req: AuthRequest, res: Response) => {
  try {
    const { dogId } = req.params;
    const { month } = req.query;

    if (!(await verifyDogOwnership(dogId, req.user!.id))) {
      return res.status(404).json({ error: 'Dog not found' });
    }

    const targetMonth = (month as string) || new Date().toISOString().slice(0, 7);
    const monthStart = `${targetMonth}-01`;

    const [currentRes, prevRes, categoryRes, weeklyRes] = await Promise.all([
      pool.query(
        `SELECT COALESCE(SUM(amount), 0) AS total FROM expenses
         WHERE dog_id = $1 AND date >= $2::date AND date < ($2::date + INTERVAL '1 month')`,
        [dogId, monthStart]
      ),
      pool.query(
        `SELECT COALESCE(SUM(amount), 0) AS total FROM expenses
         WHERE dog_id = $1 AND date >= ($2::date - INTERVAL '1 month') AND date < $2::date`,
        [dogId, monthStart]
      ),
      pool.query(
        `SELECT category, COALESCE(SUM(amount), 0) AS total FROM expenses
         WHERE dog_id = $1 AND date >= $2::date AND date < ($2::date + INTERVAL '1 month')
         GROUP BY category ORDER BY total DESC`,
        [dogId, monthStart]
      ),
      pool.query(
        `SELECT
           EXTRACT(DOW FROM date) AS dow,
           COALESCE(SUM(amount), 0) AS total
         FROM expenses
         WHERE dog_id = $1
           AND date >= date_trunc('week', CURRENT_DATE)
           AND date < date_trunc('week', CURRENT_DATE) + INTERVAL '7 days'
         GROUP BY dow ORDER BY dow`,
        [dogId]
      ),
    ]);

    const currentTotal = parseFloat(currentRes.rows[0].total);
    const prevTotal = parseFloat(prevRes.rows[0].total);

    res.json({
      currentTotal,
      prevTotal,
      percentChange: prevTotal > 0 ? ((currentTotal - prevTotal) / prevTotal) * 100 : null,
      categoryBreakdown: categoryRes.rows.map((r: any) => ({
        category: r.category,
        total: parseFloat(r.total),
      })),
      weeklyData: weeklyRes.rows.map((r: any) => ({
        dow: parseInt(r.dow),
        total: parseFloat(r.total),
      })),
    });
  } catch (error) {
    console.error('Get expense stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
