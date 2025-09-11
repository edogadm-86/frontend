"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// routes/public.ts
const express_1 = require("express");
const database_1 = __importDefault(require("../config/database"));
const router = (0, express_1.Router)();
// GET /api/public/dog/:id
router.get('/dog/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await database_1.default.query(`SELECT d.id, d.name, d.breed, d.age, d.weight, d.profile_picture,
              u.name as owner_name, u.phone as owner_phone
       FROM dogs d
       JOIN users u ON d.user_id = u.id
       WHERE d.id = $1`, [id]);
        if (!result.rows[0])
            return res.status(404).json({ error: 'Dog not found' });
        // expose only safe fields
        const dog = result.rows[0];
        res.json({
            dog: {
                id: dog.id,
                name: dog.name,
                breed: dog.breed,
                age: dog.age,
                weight: dog.weight,
                profile_picture: dog.profile_picture,
            },
            owner: {
                name: dog.owner_name,
                phone: dog.owner_phone, // you may decide to hide this or show only partially
            }
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});
exports.default = router;
//# sourceMappingURL=public.js.map