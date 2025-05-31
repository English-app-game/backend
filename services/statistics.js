import { ScoreModel } from "../models/Score.js";

export const getTopScores = async (req, res) => {
  try {
    const topPlayers = await ScoreModel.aggregate([
      {
        $group: {
          _id: "$player",
          totalScore: { $sum: "$score" }
        }
      },
      {
        $sort: { totalScore: -1 }
      },
      {
        $lookup: {
          from: "users", 
          localField: "_id",
          foreignField: "_id",
          as: "playerInfo"
        }
      },
      {
        $unwind: "$playerInfo"
      },
      {
        $project: {
          _id: 0,
          avatar:"$playerInfo.avatarImg",
          name: "$playerInfo.name",
          score: "$totalScore"
        }
      }
    ]);

    res.json(topPlayers);
  } catch (err) {
    console.error("Error in getTopScores:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getTopPlayers = async (req, res) => {
  try {
    const topPlayers = await ScoreModel.aggregate([
      {
        $group: {
          _id: "$player",
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $lookup: {
          from: "users", 
          localField: "_id",
          foreignField: "_id",
          as: "playerInfo"
        }
      },
      {
        $unwind: "$playerInfo"
      },
      {
        $project: {
          _id: 0,
          avatar:"$playerInfo.avatarImg",
          name: "$playerInfo.name",
          count: "$count"
        }
      }
    ]);

    res.json(topPlayers);
  } catch (err) {
    console.error("Error in getTopPlayers:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getTopGames = async (req, res) => {
  try {
    const topGames = await ScoreModel.aggregate([
      {
        $group: {
          _id: "$gameTypeId",
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $lookup: {
          from: "gametypes",
          localField: "_id",
          foreignField: "_id",
          as: "game"
        }
      },
      {
        $unwind: "$game"
      },
      {
        $project: {
          _id: 0,
          name: "$game.name",
          count: "$count"
        }
      }
    ]);

    res.json(topGames);
  } catch (err) {
    console.error("Error in getTopGames:", err);
    res.status(500).json({ message: "Server error" });
  }
};