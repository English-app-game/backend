import mongoose from "mongoose";

const gameTypeSchema = new mongoose.Schema({
  name: { type: String,
     required: true },
  levelRange: [{ type: String,
     required: true }],
  minNumOfPlayers: { type: Number,
     required: true },
  maxNumOfPlayers: { type: Number,
     required: true },
}, { timestamps: true });

export default mongoose.model("GameType", gameTypeSchema);
