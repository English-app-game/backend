import { addRoomToDB as addRoomToDbService } from "../services/rooms/addRoomToDB.js";
import { validateCreateRoomFields } from "../utils/validateCreateRoomFields.js";
import {GameRoomModel} from "../models/GameRoom.js";
import { UserModel } from "../models/User.js";
import {MAX_PLAYERS} from "../config/consts.js";
import mongoose from "mongoose";



async function addRoomToDB(req, res) {
  try {
    console.log(req.body);
    const roomData = req.body;
    if (!roomData) {
      return res.status(400).json({
        error: `No Room Data passed!`,
      });
    }

    const missingFields = validateCreateRoomFields(roomData);
    if (missingFields.length > 0) {
      return res.status(400).json({
        error: `Missing required fields: ${missingFields.join(", ")}`,
      });
    }

        if (!roomData.gameType) {
      return res.status(400).json({ error: "Missing required field: gameType" });
    }

    if (!mongoose.Types.ObjectId.isValid(roomData.gameType)) {
      return res.status(400).json({ error: "Invalid gameType ID" });
    }


    const newRoom = await addRoomToDbService(roomData);

    return res.status(201).json({
      message: "Room created successfully",
      room: newRoom,
    });
  } catch (err) {
    console.error("❌ Error in addRoomToDB controller:", err);
    return res.status(500).json({ error: "Failed to create room" });
  }
}

async function getRooms(req,res){
  try {
   const rooms = await GameRoomModel.find();
    console.log("🔥 Rooms fetched from DB:", rooms);
    res.json(rooms);
  } catch (err) {
    console.error("❌ Error in /api/rooms:", err);
    res.status(500).json({ message: "Server error" });
  }
}

async function checkRoomAvailabilityByKey(req, res) {
  try {
    const { key } = req.params;
    console.log("🔍 Checking room key:", req.params.key);

    if (!key) {
      return res.status(400).json({ message: "Room key is required" });
    }

    const room = await GameRoomModel.findOne({ key });
    console.log("🔎 Room found:", room);


    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    if (room.amountOfPlayers >= room.maxPlayers) {
      return res.status(400).json({ message: "Room is full" });
    }

    return res.json({ message: "Room is available", roomId: room.key });
  } catch (err) {
    console.error("❌ Error in checkRoomAvailability:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

async function getRoomWithPlayers(req, res) {
  try {
    const { key } = req.params;
    if (!key) {
      return res.status(400).json({ message: "Room key is required" });
    }

    const room = await GameRoomModel.findOne({ key }).populate("players admin", "name avatarImg");

    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    const { players, admin } = room;

    return res.json({ players, admin, key });
  } catch (err) {
    console.error("Error in getRoomWithPlayers:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

export const roomController = {
  addRoomToDB,
  getRooms,
  checkRoomAvailabilityByKey,
  getRoomWithPlayers
};
