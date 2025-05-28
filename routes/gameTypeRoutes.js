import express from "express";
import { GameTypeModel } from "../models/GameType.js"; 

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const gameTypes = await GameTypeModel.find(); 
    res.json(gameTypes);
  } catch (error) {
    console.error("❌ Error fetching game types:", error);
    res.status(500).json({ error: "Failed to fetch game types" });
  }
});

export default router;
