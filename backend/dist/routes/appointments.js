"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const appointmentController_1 = require("../controllers/appointmentController");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const router = express_1.default.Router();
// All routes are protected
router.use(auth_1.authenticateToken);
router.get('/dog/:dogId', appointmentController_1.getAppointments);
router.post('/dog/:dogId', validation_1.validateAppointment, validation_1.validateRequest, appointmentController_1.createAppointment);
router.put('/dog/:dogId/:id', validation_1.validateAppointment, validation_1.validateRequest, appointmentController_1.updateAppointment);
router.delete('/dog/:dogId/:id', appointmentController_1.deleteAppointment);
exports.default = router;
//# sourceMappingURL=appointments.js.map