import { GameRoomModel } from "../models/GameRoom.js";
import { ScoreModel } from "../models/Score.js";

export async function saveScore(req, res) {
  try {
    const { player, roomId, gameTypeId, score } = req.body;

    if (!player || !roomId || !gameTypeId || score == null) {
      return res.status(400).json({ error: "Missing fields" });
    }

    console.log(player, roomId, gameTypeId, score);

    // const room = await GameRoomModel.find({ key: roomId });
    // console.log(room);

    const newScore = await ScoreModel.create({ player, roomKey: roomId, gameTypeId, score });
    return res.status(201).json({ message: "Score saved", data: newScore });
  } catch (err) {
    console.error("Error saving score:", err);
    return res.status(500).json({ error: "Server error" });
  }
}

export async function getLastScoreByPlayer(req, res) {
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
}
