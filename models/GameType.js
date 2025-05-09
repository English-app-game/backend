import mongoose from "mongoose";
import { TABLE_NAMES } from "./tables_names.js";

const gameTypeSchema = new mongoose.Schema({
  name: { type: String,
     required: true },
  levelRange: [{ type: String,
     required: true }],
  minNumOfPlayers: { type: Number,
     required: true },
}, { timestamps: true });

const GameType = mongoose.model(TABLE_NAMES.GAME_TYPE, gameTypeSchema);

export { GameType as GameTypeModel };