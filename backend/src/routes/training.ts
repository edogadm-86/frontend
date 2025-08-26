import express from 'express';
import { getTrainingSessions, createTrainingSession, updateTrainingSession, deleteTrainingSession } from '../controllers/trainingController';
import { authenticateToken } from '../middleware/auth';
import { validateTrainingSession, validateRequest } from '../middleware/validation';

const router = express.Router();

// All routes are protected
router.use(authenticateToken);

router.get('/dog/:dogId', getTrainingSessions);
router.post('/dog/:dogId', validateTrainingSession, validateRequest, createTrainingSession);
router.put('/dog/:dogId/:id', validateTrainingSession, validateRequest, updateTrainingSession);
router.delete('/dog/:dogId/:id', deleteTrainingSession);

export default router;