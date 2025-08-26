import express from 'express';
import { getVaccinations, createVaccination, updateVaccination, deleteVaccination } from '../controllers/vaccinationController';
import { authenticateToken } from '../middleware/auth';
import { validateVaccination, validateRequest } from '../middleware/validation';

const router = express.Router();

// All routes are protected
router.use(authenticateToken);

router.get('/dog/:dogId', getVaccinations);
router.post('/dog/:dogId', validateVaccination, validateRequest, createVaccination);
router.put('/dog/:dogId/:id', validateVaccination, validateRequest, updateVaccination);
router.delete('/dog/:dogId/:id', deleteVaccination);

export default router;