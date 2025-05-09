import mongoose from "mongoose";
import { TABLE_NAMES } from "./tables_names.js";
import { GAME_ROOM_STATUS } from "./statuses.js";

const gameRoomSchema = new mongoose.Schema({
    amountOfPlayers: {
        type: Number,
        required: true
    },
    maxPlayers: {
        type: Number,
        required: true
    },
    gameType: { type: mongoose.Schema.Types.ObjectId, ref: TABLE_NAMES.GAME_TYPE,
         required: true },
    key: { type: String },
    isActive: {
        type: Boolean,
        required: true
    },
    admin: { type: mongoose.Schema.Types.ObjectId, ref: TABLE_NAMES.USER, 
        required: true },
    currentStatus: {
        type: String,
        enum: Object.values(GAME_ROOM_STATUS),
        required: true
    },
    level: {
        type: String,
        required: true
    },
    finishedAt: { type: Date },
}, { timestamps: true });

const GameRoom = mongoose.model(TABLE_NAMES.GAME_ROOM, gameRoomSchema);

export { GameRoom as GameRoomModel };

