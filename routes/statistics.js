import express from 'express';
import { getTopScores,getTopGames, getTopPlayers } from '../services/statistics.js';

const router = express.Router();

router.get("/scores", getTopScores);
router.get("/games",getTopGames);
router.get("/players",getTopPlayers);


export default router;
