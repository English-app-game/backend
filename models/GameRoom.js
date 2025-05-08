import mongoose from "mongoose";

const gameRoomSchema = new mongoose.Schema({
  amountOfPlayers: { type: Number, 
    required: true },
  maxPlayers: { type: Number,
     required: true },
  gameType: { type: mongoose.Schema.Types.ObjectId, ref: "GameType",
     required: true },
  key: { type: String },
  isActive: { type: Boolean,
     required: true },
  admin: { type: mongoose.Schema.Types.ObjectId, ref: "User", 
    required: true },
  players: [{ type: mongoose.Schema.Types.ObjectId, ref: "User",
     required: true }],
  currentStatus: {
    type: String,
    enum: ["waiting", "playing", "finished", "error"],
    required: true,
  },
  level: { type: String, 
    required: true },
  finishedAt: { type: Date },
}, { timestamps: true });

const GameRoom =  mongoose.model("GameRoom", gameRoomSchema);

export {GameRoom as GameRoomModel}

