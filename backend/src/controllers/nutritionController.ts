import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import pool from '../config/database';
import { AuthRequest } from '../types';

export const getNutritionRecords = async (req: AuthRequest, res: Response) => {
  try {
    const { dogId } = req.params;

    // Verify dog belongs to user
    const dogCheck = await pool.query(
      'SELECT id FROM dogs WHERE id = $1 AND user_id = $2',
      [dogId, req.user!.id]
    );

    if (dogCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Dog not found' });
    }

    const result = await pool.query(
      'SELECT * FROM nutrition_records WHERE dog_id = $1 ORDER BY date DESC',
      [dogId]
    );

    res.json({ nutritionRecords: result.rows });
  } catch (error) {
    console.error('Get nutrition records error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createNutritionRecord = async (req: AuthRequest, res: Response) => {
  try {
    const { dogId } = req.params;
    const { 
      date, 
      food_brand, 
      food_type, 
      daily_amount, 
      calories_per_day, 
      protein_percentage, 
      fat_percentage, 
      carb_percentage, 
      supplements, 
      notes, 
      weight_at_time 
    } = req.body;

    // Verify dog belongs to user
    const dogCheck = await pool.query(
      'SELECT id FROM dogs WHERE id = $1 AND user_id = $2',
      [dogId, req.user!.id]
    );

    if (dogCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Dog not found' });
    }

    const recordId = uuidv4();
    const result = await pool.query(
      `INSERT INTO nutrition_records 
       (id, dog_id, date, food_brand, food_type, daily_amount, calories_per_day, 
        protein_percentage, fat_percentage, carb_percentage, supplements, notes, weight_at_time) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *`,
      [recordId, dogId, date, food_brand, food_type, daily_amount, calories_per_day, 
       protein_percentage, fat_percentage, carb_percentage, supplements || [], notes || null, weight_at_time]
    );

    res.status(201).json({
      message: 'Nutrition record created successfully',
      nutritionRecord: result.rows[0]
    });
  } catch (error) {
    console.error('Create nutrition record error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateNutritionRecord = async (req: AuthRequest, res: Response) => {
  try {
    const { dogId, id } = req.params;
    const { 
      date, 
      food_brand, 
      food_type, 
      daily_amount, 
      calories_per_day, 
      protein_percentage, 
      fat_percentage, 
      carb_percentage, 
      supplements, 
      notes, 
      weight_at_time 
    } = req.body;

    // Verify dog belongs to user
    const dogCheck = await pool.query(
      'SELECT id FROM dogs WHERE id = $1 AND user_id = $2',
      [dogId, req.user!.id]
    );

    if (dogCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Dog not found' });
    }

    const result = await pool.query(
      `UPDATE nutrition_records SET 
       date = $1, food_brand = $2, food_type = $3, daily_amount = $4, calories_per_day = $5,
       protein_percentage = $6, fat_percentage = $7, carb_percentage = $8, supplements = $9, 
       notes = $10, weight_at_time = $11, updated_at = CURRENT_TIMESTAMP
       WHERE id = $12 AND dog_id = $13 RETURNING *`,
      [date, food_brand, food_type, daily_amount, calories_per_day, 
       protein_percentage, fat_percentage, carb_percentage, supplements || [], notes || null, 
       weight_at_time, id, dogId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Nutrition record not found' });
    }

    res.json({
      message: 'Nutrition record updated successfully',
      nutritionRecord: result.rows[0]
    });
  } catch (error) {
    console.error('Update nutrition record error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteNutritionRecord = async (req: AuthRequest, res: Response) => {
  try {
    const { dogId, id } = req.params;

    // Verify dog belongs to user
    const dogCheck = await pool.query(
      'SELECT id FROM dogs WHERE id = $1 AND user_id = $2',
      [dogId, req.user!.id]
    );

    if (dogCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Dog not found' });
    }

    const result = await pool.query(
      'DELETE FROM nutrition_records WHERE id = $1 AND dog_id = $2 RETURNING id',
      [id, dogId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Nutrition record not found' });
    }

    res.json({ message: 'Nutrition record deleted successfully' });
  } catch (error) {
    console.error('Delete nutrition record error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getMealPlan = async (req: AuthRequest, res: Response) => {
  try {
    const { dogId } = req.params;

    // Verify dog belongs to user
    const dogCheck = await pool.query(
      'SELECT id FROM dogs WHERE id = $1 AND user_id = $2',
      [dogId, req.user!.id]
    );

    if (dogCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Dog not found' });
    }

    const result = await pool.query(
      'SELECT * FROM meal_plans WHERE dog_id = $1 AND is_active = true ORDER BY meal_time ASC',
      [dogId]
    );

    res.json({ mealPlan: result.rows });
  } catch (error) {
    console.error('Get meal plan error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createMealPlan = async (req: AuthRequest, res: Response) => {
  try {
    const { dogId } = req.params;
    const { meal_time, food_type, amount, calories } = req.body;

    // Verify dog belongs to user
    const dogCheck = await pool.query(
      'SELECT id FROM dogs WHERE id = $1 AND user_id = $2',
      [dogId, req.user!.id]
    );

    if (dogCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Dog not found' });
    }

    const mealId = uuidv4();
    const result = await pool.query(
      'INSERT INTO meal_plans (id, dog_id, meal_time, food_type, amount, calories) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [mealId, dogId, meal_time, food_type, amount, calories]
    );

    res.status(201).json({
      message: 'Meal plan entry created successfully',
      mealPlan: result.rows[0]
    });
  } catch (error) {
    console.error('Create meal plan error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateMealPlan = async (req: AuthRequest, res: Response) => {
  try {
    const { dogId, id } = req.params;
    const { meal_time, food_type, amount, calories, is_active } = req.body;

    // Verify dog belongs to user
    const dogCheck = await pool.query(
      'SELECT id FROM dogs WHERE id = $1 AND user_id = $2',
      [dogId, req.user!.id]
    );

    if (dogCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Dog not found' });
    }

    const result = await pool.query(
      'UPDATE meal_plans SET meal_time = $1, food_type = $2, amount = $3, calories = $4, is_active = $5, updated_at = CURRENT_TIMESTAMP WHERE id = $6 AND dog_id = $7 RETURNING *',
      [meal_time, food_type, amount, calories, is_active !== false, id, dogId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Meal plan entry not found' });
    }

    res.json({
      message: 'Meal plan updated successfully',
      mealPlan: result.rows[0]
    });
  } catch (error) {
    console.error('Update meal plan error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteMealPlan = async (req: AuthRequest, res: Response) => {
  try {
    const { dogId, id } = req.params;

    // Verify dog belongs to user
    const dogCheck = await pool.query(
      'SELECT id FROM dogs WHERE id = $1 AND user_id = $2',
      [dogId, req.user!.id]
    );

    if (dogCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Dog not found' });
    }

    const result = await pool.query(
      'DELETE FROM meal_plans WHERE id = $1 AND dog_id = $2 RETURNING id',
      [id, dogId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Meal plan entry not found' });
    }

    res.json({ message: 'Meal plan entry deleted successfully' });
  } catch (error) {
    console.error('Delete meal plan error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateEntireMealPlan = async (req: AuthRequest, res: Response) => {
  try {
    const { dogId } = req.params;
    const { mealPlan } = req.body; // Array of meal plan entries

    // Verify dog belongs to user
    const dogCheck = await pool.query(
      'SELECT id FROM dogs WHERE id = $1 AND user_id = $2',
      [dogId, req.user!.id]
    );

    if (dogCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Dog not found' });
    }

    // Start transaction
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Deactivate all existing meal plans for this dog
      await client.query(
        'UPDATE meal_plans SET is_active = false WHERE dog_id = $1',
        [dogId]
      );

      // Insert new meal plan entries
      const newMealPlan = [];
      for (const meal of mealPlan) {
        const mealId = uuidv4();
        const result = await client.query(
          'INSERT INTO meal_plans (id, dog_id, meal_time, food_type, amount, calories) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
          [mealId, dogId, meal.meal_time, meal.food_type, meal.amount, meal.calories]
        );
        newMealPlan.push(result.rows[0]);
      }

      await client.query('COMMIT');

      res.json({
        message: 'Meal plan updated successfully',
        mealPlan: newMealPlan
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Update entire meal plan error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getNutritionStats = async (req: AuthRequest, res: Response) => {
  try {
    const { dogId } = req.params;

    // Verify dog belongs to user
    const dogCheck = await pool.query(
      'SELECT id FROM dogs WHERE id = $1 AND user_id = $2',
      [dogId, req.user!.id]
    );

    if (dogCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Dog not found' });
    }

    // Get latest nutrition record
    const latestRecord = await pool.query(
      'SELECT * FROM nutrition_records WHERE dog_id = $1 ORDER BY date DESC LIMIT 1',
      [dogId]
    );

    // Get current meal plan
    const mealPlan = await pool.query(
      'SELECT * FROM meal_plans WHERE dog_id = $1 AND is_active = true ORDER BY meal_time ASC',
      [dogId]
    );

    // Calculate daily totals from meal plan
    const dailyTotals = mealPlan.rows.reduce((totals, meal) => ({
      amount: totals.amount + parseFloat(meal.amount),
      calories: totals.calories + parseInt(meal.calories)
    }), { amount: 0, calories: 0 });

    // Get nutrition history for trends
    const nutritionHistory = await pool.query(
      'SELECT date, weight_at_time, calories_per_day FROM nutrition_records WHERE dog_id = $1 ORDER BY date DESC LIMIT 30',
      [dogId]
    );

    res.json({
      latestRecord: latestRecord.rows[0] || null,
      mealPlan: mealPlan.rows,
      dailyTotals,
      nutritionHistory: nutritionHistory.rows,
      hasData: latestRecord.rows.length > 0 || mealPlan.rows.length > 0
    });
  } catch (error) {
    console.error('Get nutrition stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};