import express from 'express';
import { getAppointments, createAppointment, updateAppointment, deleteAppointment } from '../controllers/appointmentController';
import { authenticateToken } from '../middleware/auth';
import { validateAppointment, validateRequest } from '../middleware/validation';

const router = express.Router();

// All routes are protected
router.use(authenticateToken);

router.get('/dog/:dogId', getAppointments);
router.post('/dog/:dogId', validateAppointment, validateRequest, createAppointment);
router.put('/dog/:dogId/:id', validateAppointment, validateRequest, updateAppointment);
router.delete('/dog/:dogId/:id', deleteAppointment);

export default router;