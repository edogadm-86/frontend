"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateMealPlan = exports.validateNutritionRecord = exports.validateEmergencyContact = exports.validateTrainingSession = exports.validateAppointment = exports.validateHealthRecord = exports.validateVaccination = exports.validateDog = exports.validateUser = exports.validateRequest = void 0;
const express_validator_1 = require("express-validator");
const validateRequest = (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};
exports.validateRequest = validateRequest;
exports.validateUser = [
    (0, express_validator_1.body)('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
    (0, express_validator_1.body)('email').isEmail().withMessage('Valid email is required'),
    (0, express_validator_1.body)('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    (0, express_validator_1.body)('phone').optional().isMobilePhone('any').withMessage('Valid phone number required'),
];
exports.validateDog = [
    (0, express_validator_1.body)('name').trim().isLength({ min: 1 }).withMessage('Dog name is required'),
    (0, express_validator_1.body)('breed').trim().isLength({ min: 1 }).withMessage('Breed is required'),
    (0, express_validator_1.body)('date_of_birth').isISO8601().withMessage('Valid date of birth is required'),
    (0, express_validator_1.body)('weight').isFloat({ min: 0.1 }).withMessage('Weight must be greater than 0'),
    (0, express_validator_1.body)('profile_picture').optional().isString(),
    (0, express_validator_1.body)('microchip_id').optional().isString(),
    (0, express_validator_1.body)('passport_number').optional().isString(),
];
exports.validateVaccination = [
    (0, express_validator_1.body)('vaccine_name').trim().isLength({ min: 1 }).withMessage('Vaccine name is required'),
    (0, express_validator_1.body)('vaccine_type').trim().isLength({ min: 1 }).withMessage('Vaccine type is required'),
    (0, express_validator_1.body)('date_given').isISO8601().withMessage('Valid date is required'),
    (0, express_validator_1.body)('veterinarian').trim().isLength({ min: 1 }).withMessage('Veterinarian is required'),
];
exports.validateHealthRecord = [
    (0, express_validator_1.body)('title').trim().isLength({ min: 1 }).withMessage('Title is required'),
    (0, express_validator_1.body)('description').trim().isLength({ min: 1 }).withMessage('Description is required'),
    (0, express_validator_1.body)('date').isISO8601().withMessage('Valid date is required'),
    (0, express_validator_1.body)('type').isIn(['vet-visit', 'medication', 'illness', 'injury', 'other']).withMessage('Invalid type'),
];
exports.validateAppointment = [
    (0, express_validator_1.body)('title').trim().isLength({ min: 1 }).withMessage('Title is required'),
    (0, express_validator_1.body)('type').isIn(['vet', 'grooming', 'training', 'walk', 'feeding', 'other']).withMessage('Invalid type'),
    (0, express_validator_1.body)('date').isISO8601().withMessage('Valid date is required'),
    (0, express_validator_1.body)('time').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid time format required (HH:MM)'),
];
exports.validateTrainingSession = [
    (0, express_validator_1.body)('date').isISO8601().withMessage('Valid date is required'),
    (0, express_validator_1.body)('duration').isInt({ min: 1 }).withMessage('Duration must be at least 1 minute'),
    (0, express_validator_1.body)('progress').isIn(['excellent', 'good', 'fair', 'needs-work']).withMessage('Invalid progress value'),
    (0, express_validator_1.body)('notes').trim().isLength({ min: 1 }).withMessage('Notes are required'),
];
exports.validateEmergencyContact = [
    (0, express_validator_1.body)('name').trim().isLength({ min: 1 }).withMessage('Name is required'),
    (0, express_validator_1.body)('type').isIn(['vet', 'emergency-vet', 'poison-control', 'other']).withMessage('Invalid type'),
    (0, express_validator_1.body)('phone').isMobilePhone('any').withMessage('Valid phone number required'),
];
exports.validateNutritionRecord = [
    (0, express_validator_1.body)('date').isISO8601().withMessage('Valid date is required'),
    (0, express_validator_1.body)('food_brand').trim().isLength({ min: 1 }).withMessage('Food brand is required'),
    (0, express_validator_1.body)('food_type').trim().isLength({ min: 1 }).withMessage('Food type is required'),
    (0, express_validator_1.body)('daily_amount').isFloat({ min: 0.1 }).withMessage('Daily amount must be greater than 0'),
    (0, express_validator_1.body)('calories_per_day').isInt({ min: 1 }).withMessage('Calories per day must be greater than 0'),
    (0, express_validator_1.body)('protein_percentage').isFloat({ min: 0, max: 100 }).withMessage('Protein percentage must be between 0 and 100'),
    (0, express_validator_1.body)('fat_percentage').isFloat({ min: 0, max: 100 }).withMessage('Fat percentage must be between 0 and 100'),
    (0, express_validator_1.body)('carb_percentage').isFloat({ min: 0, max: 100 }).withMessage('Carbohydrate percentage must be between 0 and 100'),
    (0, express_validator_1.body)('weight_at_time').isFloat({ min: 0.1 }).withMessage('Weight must be greater than 0'),
];
exports.validateMealPlan = [
    (0, express_validator_1.body)('meal_time').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid time format required (HH:MM)'),
    (0, express_validator_1.body)('food_type').trim().isLength({ min: 1 }).withMessage('Food type is required'),
    (0, express_validator_1.body)('amount').isFloat({ min: 0.1 }).withMessage('Amount must be greater than 0'),
    (0, express_validator_1.body)('calories').isInt({ min: 1 }).withMessage('Calories must be greater than 0'),
];
//# sourceMappingURL=validation.js.map