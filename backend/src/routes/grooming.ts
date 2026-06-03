import express from 'express';
import { getGroomingSessions, createGroomingSession, updateGroomingSession, deleteGroomingSession } from '../controllers/groomingController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();
router.use(authenticateToken);

router.get('/dog/:dogId', getGroomingSessions);
router.post('/dog/:dogId', createGroomingSession);
router.put('/dog/:dogId/:id', updateGroomingSession);
router.delete('/dog/:dogId/:id', deleteGroomingSession);

export default router;
