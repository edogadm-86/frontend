"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const vaccinationController_1 = require("../controllers/vaccinationController");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const router = express_1.default.Router();
// All routes are protected
router.use(auth_1.authenticateToken);
router.get('/dog/:dogId', vaccinationController_1.getVaccinations);
router.post('/dog/:dogId', validation_1.validateVaccination, validation_1.validateRequest, vaccinationController_1.createVaccination);
router.put('/dog/:dogId/:id', validation_1.validateVaccination, validation_1.validateRequest, vaccinationController_1.updateVaccination);
router.delete('/dog/:dogId/:id', vaccinationController_1.deleteVaccination);
exports.default = router;
//# sourceMappingURL=vaccinations.js.map