import { body, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

export const validateRequest = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

export const validateUser = [
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('phone').optional().isMobilePhone('any').withMessage('Valid phone number required'),
];

export const validateDog = [
  body('name').trim().isLength({ min: 1 }).withMessage('Dog name is required'),
  body('breed').trim().isLength({ min: 1 }).withMessage('Breed is required'),
  body('age').isInt({ min: 0, max: 30 }).withMessage('Age must be between 0 and 30'),
  body('weight').isFloat({ min: 0.1 }).withMessage('Weight must be greater than 0'),
];

export const validateVaccination = [
  body('vaccine_name').trim().isLength({ min: 1 }).withMessage('Vaccine name is required'),
  body('vaccine_type').trim().isLength({ min: 1 }).withMessage('Vaccine type is required'),
  body('date_given').isISO8601().withMessage('Valid date is required'),
  body('veterinarian').trim().isLength({ min: 1 }).withMessage('Veterinarian is required'),
];

export const validateHealthRecord = [
  body('title').trim().isLength({ min: 1 }).withMessage('Title is required'),
  body('description').trim().isLength({ min: 1 }).withMessage('Description is required'),
  body('date').isISO8601().withMessage('Valid date is required'),
  body('type').isIn(['vet-visit', 'medication', 'illness', 'injury', 'other']).withMessage('Invalid type'),
];

export const validateAppointment = [
  body('title').trim().isLength({ min: 1 }).withMessage('Title is required'),
  body('type').isIn(['vet', 'grooming', 'training', 'walk', 'feeding', 'other']).withMessage('Invalid type'),
  body('date').isISO8601().withMessage('Valid date is required'),
  body('time').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid time format required (HH:MM)'),
];

export const validateTrainingSession = [
  body('date').isISO8601().withMessage('Valid date is required'),
  body('duration').isInt({ min: 1 }).withMessage('Duration must be at least 1 minute'),
  body('progress').isIn(['excellent', 'good', 'fair', 'needs-work']).withMessage('Invalid progress value'),
  body('notes').trim().isLength({ min: 1 }).withMessage('Notes are required'),
];

export const validateEmergencyContact = [
  body('name').trim().isLength({ min: 1 }).withMessage('Name is required'),
  body('type').isIn(['vet', 'emergency-vet', 'poison-control', 'other']).withMessage('Invalid type'),
  body('phone').isMobilePhone('any').withMessage('Valid phone number required'),
];
export const validateNutritionRecord = [
  body('date').isISO8601().withMessage('Valid date is required'),
  body('food_brand').trim().isLength({ min: 1 }).withMessage('Food brand is required'),
  body('food_type').trim().isLength({ min: 1 }).withMessage('Food type is required'),
  body('daily_amount').isFloat({ min: 0.1 }).withMessage('Daily amount must be greater than 0'),
  body('calories_per_day').isInt({ min: 1 }).withMessage('Calories per day must be greater than 0'),
  body('protein_percentage').isFloat({ min: 0, max: 100 }).withMessage('Protein percentage must be between 0 and 100'),
  body('fat_percentage').isFloat({ min: 0, max: 100 }).withMessage('Fat percentage must be between 0 and 100'),
  body('carb_percentage').isFloat({ min: 0, max: 100 }).withMessage('Carbohydrate percentage must be between 0 and 100'),
  body('weight_at_time').isFloat({ min: 0.1 }).withMessage('Weight must be greater than 0'),
];

export const validateMealPlan = [
  body('meal_time').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid time format required (HH:MM)'),
  body('food_type').trim().isLength({ min: 1 }).withMessage('Food type is required'),
  body('amount').isFloat({ min: 0.1 }).withMessage('Amount must be greater than 0'),
  body('calories').isInt({ min: 1 }).withMessage('Calories must be greater than 0'),
];
