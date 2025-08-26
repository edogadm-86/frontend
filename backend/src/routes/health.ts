import express from 'express';
import { getHealthRecords, createHealthRecord, updateHealthRecord, deleteHealthRecord } from '../controllers/healthController';
import { authenticateToken } from '../middleware/auth';
import { validateHealthRecord, validateRequest } from '../middleware/validation';

const router = express.Router();

// All routes are protected
router.use(authenticateToken);

router.get('/dog/:dogId', getHealthRecords);
router.post('/dog/:dogId', validateHealthRecord, validateRequest, createHealthRecord);
router.put('/dog/:dogId/:id', validateHealthRecord, validateRequest, updateHealthRecord);
router.delete('/dog/:dogId/:id', deleteHealthRecord);

export default router;