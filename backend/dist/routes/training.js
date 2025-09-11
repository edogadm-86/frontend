"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const trainingController_1 = require("../controllers/trainingController");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const router = express_1.default.Router();
// All routes are protected
router.use(auth_1.authenticateToken);
router.get('/dog/:dogId', trainingController_1.getTrainingSessions);
router.post('/dog/:dogId', validation_1.validateTrainingSession, validation_1.validateRequest, trainingController_1.createTrainingSession);
router.put('/dog/:dogId/:id', validation_1.validateTrainingSession, validation_1.validateRequest, trainingController_1.updateTrainingSession);
router.delete('/dog/:dogId/:id', trainingController_1.deleteTrainingSession);
exports.default = router;
//# sourceMappingURL=training.js.map