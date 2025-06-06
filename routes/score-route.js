import express from "express";
import { saveScore } from "../controllers/scoreController.js";
import {ScoreModel } from "../models/Score.js";

const router = express.Router();

router.post("/save", saveScore);

router.get("/last/:playerId", async (req, res) => {
  const { playerId } = req.params;

  try {
    const score = await ScoreModel.findOne({ player: playerId })
      .sort({ createdAt: -1 })
      .populate("gameTypeId");

    if (!score) return res.status(404).json({ error: "No score found" });

    res.json(score);
  } catch (err) {
    console.error("Error fetching score:", err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
