"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const nutritionController_1 = require("../controllers/nutritionController");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const router = express_1.default.Router();
// All routes are protected
router.use(auth_1.authenticateToken);
// Nutrition records routes
router.get('/dog/:dogId/records', nutritionController_1.getNutritionRecords);
router.post('/dog/:dogId/records', validation_1.validateNutritionRecord, validation_1.validateRequest, nutritionController_1.createNutritionRecord);
router.put('/dog/:dogId/records/:id', validation_1.validateNutritionRecord, validation_1.validateRequest, nutritionController_1.updateNutritionRecord);
router.delete('/dog/:dogId/records/:id', nutritionController_1.deleteNutritionRecord);
router.get('/dog/:dogId/records/:recordId/meals', nutritionController_1.getMealsForRecord);
// Meal plan routes
router.get('/dog/:dogId/meal-plan', nutritionController_1.getMealPlan);
router.post('/dog/:dogId/meal-plan', validation_1.validateMealPlan, validation_1.validateRequest, nutritionController_1.createMealPlan);
router.put('/dog/:dogId/meal-plan/:id', validation_1.validateMealPlan, validation_1.validateRequest, nutritionController_1.updateMealPlan);
router.delete('/dog/:dogId/meal-plan/:id', nutritionController_1.deleteMealPlan);
router.put('/dog/:dogId/meal-plan', nutritionController_1.updateEntireMealPlan);
// Nutrition stats route
router.get('/dog/:dogId/stats', nutritionController_1.getNutritionStats);
exports.default = router;
//# sourceMappingURL=nutrition.js.map