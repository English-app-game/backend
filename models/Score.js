import mongoose from "mongoose";

const scoreSchema = new mongoose.Schema({
  player: { type: mongoose.Schema.Types.ObjectId, ref: "User",
     required: true },
  roomId: { type: mongoose.Schema.Types.ObjectId, ref: "GameRoom",
     required: true },
  score: { type: Number,
     required: true },
  gameTypeId: { type: mongoose.Schema.Types.ObjectId, ref: "GameType",
     required: true },
}, { timestamps: true });

export default mongoose.model("Score", scoreSchema);
