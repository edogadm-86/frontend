import express from 'express';
import { getEmergencyContacts, createEmergencyContact, updateEmergencyContact, deleteEmergencyContact } from '../controllers/emergencyController';
import { authenticateToken } from '../middleware/auth';
import { validateEmergencyContact, validateRequest } from '../middleware/validation';

const router = express.Router();

// All routes are protected
router.use(authenticateToken);

router.get('/', getEmergencyContacts);
router.post('/', validateEmergencyContact, validateRequest, createEmergencyContact);
router.put('/:id', validateEmergencyContact, validateRequest, updateEmergencyContact);
router.delete('/:id', deleteEmergencyContact);

export default router;