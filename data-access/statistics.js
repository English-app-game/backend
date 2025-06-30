import { ScoreModel } from "../models/Score.js";

export async function aggregateTopScores() {
  return ScoreModel.aggregate([
    {
      $group: {
        _id: "$player",
        totalScore: { $sum: "$score" },
      },
    },
    { $sort: { totalScore: -1 } },
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        as: "playerInfo",
      },
    },
    { $unwind: "$playerInfo" },
    {
      $project: {
        _id: 0,
        avatar: "$playerInfo.avatarImg",
        name: "$playerInfo.name",
        score: "$totalScore",
      },
    },
  ]);
}

export async function aggregateTopPlayers() {
  return ScoreModel.aggregate([
    {
      $group: {
        _id: "$player",
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1 } },
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        as: "playerInfo",
      },
    },
    { $unwind: "$playerInfo" },
    {
      $project: {
        _id: 0,
        avatar: "$playerInfo.avatarImg",
        name: "$playerInfo.name",
        count: "$count",
      },
    },
  ]);
}

export async function aggregateTopGames() {
  return ScoreModel.aggregate([
    {
      $group: {
        _id: "$roomKey",
        gameTypeId: { $first: "$gameTypeId" },
      },
    },
    {
      $group: {
        _id: "$gameTypeId",
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1 } },
    {
      $lookup: {
        from: "gametypes",
        localField: "_id",
        foreignField: "_id",
        as: "game",
      },
    },
    { $unwind: "$game" },
    {
      $project: {
        _id: 0,
        name: "$game.name",
        count: "$count",
      },
    },
  ]);
}
