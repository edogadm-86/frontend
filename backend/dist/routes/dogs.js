"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dogController_1 = require("../controllers/dogController");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const router = express_1.default.Router();
// All routes are protected
router.use(auth_1.authenticateToken);
router.get('/', dogController_1.getDogs);
router.get('/:dogId/health-status', dogController_1.getDogHealthStatus);
router.post('/', validation_1.validateDog, validation_1.validateRequest, dogController_1.createDog);
router.put('/:id', validation_1.validateDog, validation_1.validateRequest, dogController_1.updateDog);
router.delete('/:id', dogController_1.deleteDog);
exports.default = router;
//# sourceMappingURL=dogs.js.map