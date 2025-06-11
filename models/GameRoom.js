import mongoose from "mongoose";
import { TABLE_NAMES } from "./tables_names.js";
import { GAME_ROOM_STATUS } from "./statuses.js";

const MAX_PLAYERS = 5;

const gameRoomSchema = new mongoose.Schema({
  players: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: TABLE_NAMES.USER
    }
  ],
  guestPlayers: [
    {
      id: String,
      name: String,
      avatarImg: String
    }
  ],
  amountOfPlayers: {
    type: Number,
    required: true,
    default: 1
  },
  maxPlayers: {
    type: Number,
    default: MAX_PLAYERS,
    immutable: true
  },
  gameType: {
    type: mongoose.Schema.Types.ObjectId,
    ref: TABLE_NAMES.GAME_TYPE,
    required: true
  },
  key: { type: String },
  isActive: {
    type: Boolean,
    required: true
  },
  isPrivate: {
    type: Boolean,
    required: true,
    default: false
  },
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: TABLE_NAMES.USER,
    required: true
  },
  currentStatus: {
    type: String,
    enum: Object.values(GAME_ROOM_STATUS),
    required: true
  },
  level: {
    type: String,
    required: true
  },
  finishedAt: { type: Date }
}, { timestamps: true });

const GameRoom = mongoose.model(TABLE_NAMES.GAME_ROOM, gameRoomSchema);

export { GameRoom as GameRoomModel };
