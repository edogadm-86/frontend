"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const uuid_1 = require("uuid");
const dogController_1 = require("../controllers/dogController");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const database_1 = __importDefault(require("../config/database"));
const router = express_1.default.Router();
// All routes are protected
router.use(auth_1.authenticateToken);
router.get('/', dogController_1.getDogs);
router.get('/:dogId/health-status', dogController_1.getDogHealthStatus);
router.post('/', validation_1.validateDog, validation_1.validateRequest, dogController_1.createDog);
router.put('/:id', validation_1.validateDog, validation_1.validateRequest, dogController_1.updateDog);
router.delete('/:id', dogController_1.deleteDog);
// ── Weight history ────────────────────────────────────────────────────────────
router.get('/:dogId/weight', async (req, res) => {
    try {
        const result = await database_1.default.query(`SELECT * FROM weight_history WHERE dog_id = $1 ORDER BY date ASC`, [req.params.dogId]);
        res.json({ entries: result.rows });
    }
    catch (error) {
        console.error('Get weight history error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.post('/:dogId/weight', async (req, res) => {
    try {
        const { weight, date, notes } = req.body;
        if (!weight || !date)
            return res.status(400).json({ error: 'weight and date are required' });
        const id = (0, uuid_1.v4)();
        const result = await database_1.default.query(`INSERT INTO weight_history (id, dog_id, weight, date, notes) VALUES ($1, $2, $3, $4, $5) RETURNING *`, [id, req.params.dogId, weight, date, notes || null]);
        // Keep the dog's current weight field in sync with latest entry
        await database_1.default.query(`UPDATE dogs SET weight = $1 WHERE id = $2`, [weight, req.params.dogId]);
        res.status(201).json({ entry: result.rows[0] });
    }
    catch (error) {
        console.error('Add weight entry error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.delete('/:dogId/weight/:entryId', async (req, res) => {
    try {
        const result = await database_1.default.query(`DELETE FROM weight_history WHERE id = $1 AND dog_id = $2 RETURNING id`, [req.params.entryId, req.params.dogId]);
        if (result.rows.length === 0)
            return res.status(404).json({ error: 'Entry not found' });
        res.json({ message: 'Entry deleted' });
    }
    catch (error) {
        console.error('Delete weight entry error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
//# sourceMappingURL=dogs.js.map