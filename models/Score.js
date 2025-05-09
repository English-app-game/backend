import mongoose from "mongoose";
import { TABLE_NAMES } from "./tables_names.js";

const scoreSchema = new mongoose.Schema({
    player: { type: mongoose.Schema.Types.ObjectId, ref: TABLE_NAMES.USER, 
        required: true },
    roomId: { type: mongoose.Schema.Types.ObjectId, ref: TABLE_NAMES.GAME_ROOM
        , required: true },
    score: { type: Number,
         required: true },
    gameTypeId: { type: mongoose.Schema.Types.ObjectId, ref: TABLE_NAMES.GAME_TYPE, 
        required: true },
}, { timestamps: true });

const Score = mongoose.model(TABLE_NAMES.SCORE, scoreSchema);

export { Score as ScoreModel };
