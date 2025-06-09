import { addRoomToDB as addRoomToDbService } from "../services/rooms/addRoomToDB.js";
import { validateCreateRoomFields } from "../utils/validateCreateRoomFields.js";
import { GameRoomModel } from "../models/GameRoom.js";
import mongoose from "mongoose";

async function addRoomToDB(req, res) {
  try {
    const roomData = req.body;
    roomData.key = crypto.randomUUID();
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

async function getRooms(req, res) {
  try {
    const rooms = await GameRoomModel.find();
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

    return res.json({ message: "Room is available", roomKey: room.key });
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

    return res.json({ ...room, players, admin, key });
  } catch (err) {
    console.error("Error in getRoomWithPlayers:", err);
    return res.status(500).json({ message: "Server error" });
  }
}
async function getRoomById(req, res) {
  try {
    const { id: key } = req.params;

    const room = await GameRoomModel.findOne({ key });
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    return res.status(200).json(room);
  } catch (err) {
    console.error("❌ Error in getRoomById controller:", err);
    return res.status(500).json({ message: "Server error" });
  }
}
async function removePlayerFromRoom(req, res) {
  try {
    const { roomKey, userId } = req.body;

    if (!roomKey || !userId) {
      return res.status(400).json({ message: "roomKey and userId are required" });
    }

    const room = await GameRoomModel.findOne({ key: roomKey });

    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    room.players = room.players.filter((playerId) => playerId.toString() !== userId);
    room.amountOfPlayers = room.players.length;

    if (room.players.length === 0) {
      await GameRoomModel.deleteOne({ key: roomKey });
      return res.status(200).json({
        message: "Player removed and room deleted (no players left)",
      });
    }

    await room.save();

    return res.status(200).json({
      message: "Player removed from room",
      room,
    });
  } catch (err) {
    console.error("❌ Error in removePlayerFromRoom controller:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

async function addPlayerToRoom(req, res) {
  try {
    const { roomKey, userId } = req.body;
    if (!roomKey || !userId) {
      return res.status(400).json({ message: "roomKey and userId are required" });
    }

    const room = await GameRoomModel.findOne({ key: roomKey });

    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    if (room.amountOfPlayers >= room.maxPlayers) {
      return res.status(400).json({ message: "Room is full" });
    }

    if (room.players.some((playerId) => playerId.toString() === userId)) {
      return res.status(200).json({ message: "Player already in the room", room });
    }

    room.players.push(userId);
    room.amountOfPlayers = room.players.length;

    await room.save();

    return res.status(200).json({
      message: "Player added to room",
      room,
    });
  } catch (err) {
    console.error("❌ Error in addPlayerToRoom controller:", err);
    return res.status(500).json({ message: "Server error" });
  }
}
async function startGame(req, res) {
  try {
    const { id: roomKey } = req.params;

    const room = await GameRoomModel.findOne({ key: roomKey });

    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    if (room.currentStatus !== "waiting") {
      return res.status(400).json({ message: "Game already started or finished" });
    }

    room.currentStatus = "playing";
    await room.save();

    return res.status(200).json(room);
  } catch (err) {
    console.error("❌ Error starting game:", err);
    res.status(500).json({ message: "Server error" });
  }
}

export const roomController = {
  addRoomToDB,
  getRooms,
  checkRoomAvailabilityByKey,
  getRoomWithPlayers,
  getRoomById,
  removePlayerFromRoom,
  addPlayerToRoom,
  startGame,
};
