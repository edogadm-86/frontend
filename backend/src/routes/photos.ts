import express from 'express';
import { getDogPhotos, createDogPhoto, updateDogPhoto, deleteDogPhoto } from '../controllers/photoController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();
router.use(authenticateToken);

router.get('/dog/:dogId', getDogPhotos);
router.post('/dog/:dogId', createDogPhoto);
router.put('/dog/:dogId/:id', updateDogPhoto);
router.delete('/dog/:dogId/:id', deleteDogPhoto);

export default router;
