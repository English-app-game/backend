import express from "express";
import { saveScore, getLastScoreByPlayer } from "../controllers/scoreController.js";
import { SAVE_SCORE_ROUTE, GET_LAST_SCORE_ROUTE } from "../config/consts.js";

const router = express.Router();

router.post(SAVE_SCORE_ROUTE, saveScore);
router.get(GET_LAST_SCORE_ROUTE, getLastScoreByPlayer);

export default router;
