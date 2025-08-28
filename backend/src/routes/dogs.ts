import express from 'express';
import { getDogs, createDog, updateDog, deleteDog, getDogHealthStatus } from '../controllers/dogController';
import { authenticateToken } from '../middleware/auth';
import { validateDog, validateRequest } from '../middleware/validation';

const router = express.Router();

// All routes are protected
router.use(authenticateToken);

router.get('/', getDogs);
router.get('/:dogId/health-status', getDogHealthStatus);
router.post('/', validateDog, validateRequest, createDog);
router.put('/:id', validateDog, validateRequest, updateDog);
router.delete('/:id', deleteDog);

export default router;