"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const healthController_1 = require("../controllers/healthController");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const router = express_1.default.Router();
// All routes are protected
router.use(auth_1.authenticateToken);
router.get('/dog/:dogId', healthController_1.getHealthRecords);
router.post('/dog/:dogId', validation_1.validateHealthRecord, validation_1.validateRequest, healthController_1.createHealthRecord);
router.put('/dog/:dogId/:id', validation_1.validateHealthRecord, validation_1.validateRequest, healthController_1.updateHealthRecord);
router.delete('/dog/:dogId/:id', healthController_1.deleteHealthRecord);
exports.default = router;
//# sourceMappingURL=health.js.map