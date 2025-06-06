import { ScoreModel } from "../models/Score.js";

export async function saveScore(req, res) {
  try {
    const { player, roomId, gameTypeId, score } = req.body;

    if (!player || !roomId || !gameTypeId || score == null) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const newScore = await ScoreModel.create({ player, roomId, gameTypeId, score });
    return res.status(201).json({ message: "Score saved", data: newScore });

  } catch (err) {
    console.error("Error saving score:", err);
    return res.status(500).json({ error: "Server error" });
  }
}
