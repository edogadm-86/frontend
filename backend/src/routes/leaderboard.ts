import express from 'express';
import { getWalkLeaderboard, updateCompetitionOptIn } from '../controllers/leaderboardController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

router.use(authenticateToken);

router.get('/walks', getWalkLeaderboard);
router.post('/walks/opt-in', updateCompetitionOptIn);

export default router;
