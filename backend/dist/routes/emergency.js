"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const emergencyController_1 = require("../controllers/emergencyController");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const router = express_1.default.Router();
// All routes are protected
router.use(auth_1.authenticateToken);
router.get('/', emergencyController_1.getEmergencyContacts);
router.post('/', validation_1.validateEmergencyContact, validation_1.validateRequest, emergencyController_1.createEmergencyContact);
router.put('/:id', validation_1.validateEmergencyContact, validation_1.validateRequest, emergencyController_1.updateEmergencyContact);
router.delete('/:id', emergencyController_1.deleteEmergencyContact);
exports.default = router;
//# sourceMappingURL=emergency.js.map