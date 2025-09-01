import express from 'express';
import { 
  getNutritionRecords, 
  createNutritionRecord, 
  updateNutritionRecord, 
  deleteNutritionRecord,
  getMealPlan,
  createMealPlan,
  updateMealPlan,
  deleteMealPlan,
  updateEntireMealPlan,
  getNutritionStats
} from '../controllers/nutritionController';
import { authenticateToken } from '../middleware/auth';
import { validateNutritionRecord, validateMealPlan, validateRequest } from '../middleware/validation';

const router = express.Router();

// All routes are protected
router.use(authenticateToken);

// Nutrition records routes
router.get('/dog/:dogId/records', getNutritionRecords);
router.post('/dog/:dogId/records', validateNutritionRecord, validateRequest, createNutritionRecord);
router.put('/dog/:dogId/records/:id', validateNutritionRecord, validateRequest, updateNutritionRecord);
router.delete('/dog/:dogId/records/:id', deleteNutritionRecord);

// Meal plan routes
router.get('/dog/:dogId/meal-plan', getMealPlan);
router.post('/dog/:dogId/meal-plan', validateMealPlan, validateRequest, createMealPlan);
router.put('/dog/:dogId/meal-plan/:id', validateMealPlan, validateRequest, updateMealPlan);
router.delete('/dog/:dogId/meal-plan/:id', deleteMealPlan);
router.put('/dog/:dogId/meal-plan', updateEntireMealPlan);

// Nutrition stats route
router.get('/dog/:dogId/stats', getNutritionStats);

export default router;