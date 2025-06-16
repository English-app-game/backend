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

    // Validate that only registered users can create rooms
    if (!mongoose.Types.ObjectId.isValid(roomData.admin)) {
      return res.status(400).json({ error: "Only registered users can create rooms" });
    }


    console.log(roomData)
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

    const { players, admin, guestPlayers } = room;
    return res.json({
      ...room.toObject(),
      players: room.players,
      admin: room.admin,
      guests: guestPlayers,
      key,
    });
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
    if (!room) return res.status(404).json({ message: "Room not found" });

    const isObjectId = mongoose.Types.ObjectId.isValid(userId);

    if (isObjectId) {
      room.players = room.players.filter((playerId) => playerId.toString() !== userId);
    } else {
      room.guestPlayers = room.guestPlayers.filter((g) => g.id !== userId);
    }

    room.amountOfPlayers = room.players.length + room.guestPlayers.length;

    if (room.amountOfPlayers === 0) {
      await GameRoomModel.deleteOne({ key: roomKey });
      return res.status(200).json({ message: "Player removed and room deleted (no players left)" });
    }

    await room.save();
    return res.status(200).json({ message: "Player removed from room", room });
  } catch (err) {
    console.error("❌ Error in removePlayerFromRoom controller:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

async function addPlayerToRoom(req, res) {
  try {
    const { roomKey, userId, guestData } = req.body;

    if (!roomKey || !userId) {
      return res.status(400).json({ message: "roomKey and userId are required" });
    }

    const room = await GameRoomModel.findOne({ key: roomKey });
    if (!room) return res.status(404).json({ message: "Room not found" });

    const isObjectId = mongoose.Types.ObjectId.isValid(userId);

    const isAlreadyInRoom = isObjectId
      ? room.players.some((p) => p.toString() === userId)
      : room.guestPlayers.some((g) => g.id === userId);

    if (isAlreadyInRoom) {
      return res.status(200).json({ message: "Player already in the room", room });
    }

    const totalPlayers = room.players.length + room.guestPlayers.length;
    if (totalPlayers >= room.maxPlayers) {
      return res.status(400).json({ message: "Room is full" });
    }

    if (isObjectId) {
      room.players.push(userId);
    } else {
      if (!guestData || !guestData.id || !guestData.name || !guestData.avatarImg) {
        return res.status(400).json({ message: "Missing guest data" });
      }
      room.guestPlayers.push(guestData);
    }

    room.amountOfPlayers = room.players.length + room.guestPlayers.length;
    await room.save();

    return res.status(200).json({ message: "Player added to room", room });
  } catch (err) {
    console.error("❌ Error in addPlayerToRoom controller:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

async function startGame(req, res) {
  try {
    const { id: roomKey } = req.params;
    const { userId } = req.body;
    console.log("Received userId:", userId);

    const room = await GameRoomModel.findOne({ key: roomKey });

    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    console.log("Room admin ID:", room.admin.toString());

    // First check if user is a guest
    const isGuest = !mongoose.Types.ObjectId.isValid(userId);
    if (isGuest) {
      return res.status(403).json({ message: "Guests cannot start games" });
    }

    // Then do admin comparison
    if (room.admin.toString() !== userId) {
      return res.status(403).json({ message: "Only the host can start the game" });
    }

    console.log("Comparison:", room.admin.toString(), "===", userId);

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
async function deleteRoom(req, res) {
  try {
    const { userId, roomKey: key } = req.body;


    if (!key || !userId) {
      return res.status(400).json({ message: "Room key and userId are required" });
    }

    const room = await GameRoomModel.findOne({ key });

    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    const isAdmin = room.admin.toString() === userId;

    if (!isAdmin) {
      return res.status(403).json({ message: "Only the room admin can delete this room" });
    }

    room.players = [];
    room.guestPlayers = [];
    room.amountOfPlayers = 0;

    await room.save();
    await GameRoomModel.deleteOne({ key });

    return res.status(200).json({ message: "Room and all players deleted successfully" , roomId: room._id});
  } catch (err) {
    console.error("❌ Error deleting room:", err);
    return res.status(500).json({ message: "Server error" });
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
  deleteRoom,
};
