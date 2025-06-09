import { getTopScoresService, getTopPlayersService, getTopGamesService } from "../services/statistics.js";

export async function getTopScores(req, res) {
  try {
    const data = await getTopScoresService();
    res.json(data);
  } catch (err) {
    console.error("Error in getTopScores:", err);
    res.status(500).json({ message: "Server error" });
  }
}

export async function getTopPlayers(req, res) {
  try {
    const data = await getTopPlayersService();
    res.json(data);
  } catch (err) {
    console.error("Error in getTopPlayers:", err);
    res.status(500).json({ message: "Server error" });
  }
}

export async function getTopGames(req, res) {
  try {
    const data = await getTopGamesService();
    res.json(data);
  } catch (err) {
    console.error("Error in getTopGames:", err);
    res.status(500).json({ message: "Server error" });
  }
}
