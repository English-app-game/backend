import { addRoomToDB as addRoomToDbService } from "../services/rooms/addRoomToDB.js";
import { validateCreateRoomFields } from "../utils/validateCreateRoomFields.js";
import { GameRoomModel } from "../models/GameRoom.js";
import { verifyToken } from "../utils/jwt.js";

import mongoose from "mongoose";
import { formatDateAndTime } from "../utils/formatDateAndTime.js";
import { GAME_LEVELS } from "../models/statuses.js";
import { RANDOM_WORD_API_URL } from "../config/consts.js";

async function addRoomToDB(req, res) {
  try {
    const body = req.body;
    if (!body) {
      return res.status(400).json({ error: "No Room Data passed!" });
    }

    // Auth
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: "No token provided" });

    const token = authHeader.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Malformed token" });

    let decodedUser;
    try {
      decodedUser = verifyToken(token);
    } catch (err) {
      return res.status(401).json({ error: "Invalid token" });
    }

    if (decodedUser.isGuest) {
      return res.status(403).json({ error: "Only registered users can create rooms" });
    }

    if (body.admin !== decodedUser.id) {
      return res.status(403).json({ error: "You can only create rooms as yourself" });
    }

    if(body.status !== "public" && body.status !== "private") {
      return res.status(400).json({ error: "Invalid status value" });
    }

    const roomData = {
      key: crypto.randomUUID(),
      admin: body.admin,
      gameType: body.gameType,
      level: body.level,
      isPrivate: body.status === "private",
      players: [],
      isActive: false,
      currentStatus: "waiting",
      createdAt: formatDateAndTime(new Date()),
      chat: [],
      amountOfPlayers: 0,
    };

    const missingFields = validateCreateRoomFields(roomData);
    if (missingFields.length > 0) {
      return res.status(400).json({
        error: `Missing required fields: ${missingFields.join(", ")}`,
      });
    }

    if (!mongoose.Types.ObjectId.isValid(roomData.gameType)) {
      return res.status(400).json({ error: "Invalid gameType ID" });
    }

    if (!mongoose.Types.ObjectId.isValid(roomData.admin)) {
      return res.status(400).json({ error: "Only registered users can create rooms" });
    }

    const ALLOWED_LEVELS = ["easy", "medium", "hard"];
    if (!ALLOWED_LEVELS.includes(roomData.level)) {
      return res.status(400).json({ error: "Invalid level value" });
    }

    // Create
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

    if (!key) {
      return res.status(400).json({ message: "Room key is required" });
    }

    const room = await GameRoomModel.findOne({ key });

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
  const MAX_RETRIES = 3;
  let attempt = 0;

  while (attempt < MAX_RETRIES) {
    try {
      const { roomKey, userId } = req.body;
      if (!roomKey || !userId) {
        return res.status(400).json({ message: "roomKey and userId are required" });
      }

      const room = await GameRoomModel.findOne({ key: roomKey });
      if (!room) {
        return res.status(404).json({ message: "Room not found" });
      }

      const isObjectId = mongoose.Types.ObjectId.isValid(userId);

      // Check if user is actually in the room
      const userExists = isObjectId
        ? room.players.some((playerId) => playerId.toString() === userId)
        : room.guestPlayers.some((g) => g.id === userId);

      if (!userExists) {
        return res.status(200).json({ message: "Player already removed from room" });
      }

      // Remove player
      if (isObjectId) {
        room.players = room.players.filter((playerId) => playerId.toString() !== userId);
      } else {
        room.guestPlayers = room.guestPlayers.filter((g) => g.id !== userId);
      }

      room.amountOfPlayers = room.players.length + room.guestPlayers.length;

      if (room.amountOfPlayers === 0) {
        // Use findOneAndDelete to avoid race conditions
        const deletedRoom = await GameRoomModel.findOneAndDelete({
          key: roomKey,
          _id: room._id,
        });

        if (deletedRoom) {
          return res
            .status(200)
            .json({ message: "Player removed and room deleted (no players left)" });
        } else {
          return res.status(200).json({ message: "Room already deleted by another process" });
        }
      }

      // Save with version check
      await room.save();
      return res.status(200).json({ message: "Player removed from room", room });
    } catch (err) {
      attempt++;

      // Handle version errors and retry
      if (
        (err.name === "VersionError" || err.name === "DocumentNotFoundError") &&
        attempt < MAX_RETRIES
      ) {
        await new Promise((resolve) => setTimeout(resolve, 100 * attempt)); // exponential backoff
        continue;
      }

      console.error("❌ Error in removePlayerFromRoom controller:", err);
      return res.status(500).json({ message: "Server error" });
    }
  }

  return res.status(500).json({ message: "Failed after multiple retries" });
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

    const room = await GameRoomModel.findOne({ key: roomKey });

    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    // First check if user is a guest
    const isGuest = !mongoose.Types.ObjectId.isValid(userId);
    if (isGuest) {
      return res.status(403).json({ message: "Guests cannot start games" });
    }

    // Then do admin comparison
    if (room.admin.toString() !== userId) {
      return res.status(403).json({ message: "Only the host can start the game" });
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
async function deleteRoom(req, res) {
  try {
    const { userId, roomKey: key, roomAdmin } = req.body;

    if (!key || !userId) {
      return res.status(400).json({ message: "Room key and userId are required" });
    }

    const room = await GameRoomModel.findOne({ key });

    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    const isAdmin = roomAdmin || room.admin.toString() === userId;

    if (!isAdmin) {
      return res.status(403).json({ message: "Only the room admin can delete this room" });
    }

    room.players = [];
    room.guestPlayers = [];
    room.amountOfPlayers = 0;

    await room.save();
    await GameRoomModel.deleteOne({ key });

    return res
      .status(200)
      .json({ message: "Room and all players deleted successfully", roomId: room._id });
  } catch (err) {
    console.error("❌ Error deleting room:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

async function getPlayersInRoom(req, res) {
  try {
    const { key } = req.params;
    if (!key) {
      return res.status(400).json({ message: "Room key is required" });
    }

    const room = await GameRoomModel.findOne({ key }).populate("players", "name avatarImg");
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    const players = [...room.players];
    const guests = [...(room.guestPlayers || [])];

    return res.json({ players, guests });
  } catch (err) {
    console.error("❌ Error in getPlayersInRoom:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

async function quickLeaveRoom(req, res) {
  try {
    const { roomKey, userId } = req.body;

    // This is a fire-and-forget endpoint for browser close scenarios
    // We won't wait for responses or do extensive validation
    if (!roomKey || !userId) {
      return res.status(200).json({ message: "Missing parameters, but acknowledged" });
    }

    // Use atomic operations to avoid race conditions
    const isObjectId = mongoose.Types.ObjectId.isValid(userId);

    if (isObjectId) {
      // Atomic update for registered users
      const result = await GameRoomModel.findOneAndUpdate(
        { key: roomKey, players: userId },
        {
          $pull: { players: userId },
          $inc: { amountOfPlayers: -1 },
        },
        { new: true }
      );

      if (result && result.amountOfPlayers === 0) {
        await GameRoomModel.findOneAndDelete({ key: roomKey, _id: result._id });
      }
    } else {
      // Atomic update for guest users
      const result = await GameRoomModel.findOneAndUpdate(
        { key: roomKey, "guestPlayers.id": userId },
        {
          $pull: { guestPlayers: { id: userId } },
          $inc: { amountOfPlayers: -1 },
        },
        { new: true }
      );

      if (result && result.amountOfPlayers === 0) {
        await GameRoomModel.findOneAndDelete({ key: roomKey, _id: result._id });
      }
    }

    return res.status(200).json({ message: "Quick leave processed" });
  } catch (err) {
    // Even if there's an error, return 200 for beacon requests
    console.error("❌ Error in quickLeaveRoom controller:", err);
    return res.status(200).json({ message: "Error occurred, but acknowledged" });
  }
}

async function getWords (req,res) {
  const {amount,level} = req.query;
  const response = await fetch(`${RANDOM_WORD_API_URL}?words=${amount}&swear=0`);

  if (!response.ok) {
    throw new Error("Failed to fetch words");
  }

  const allWords = await response.json();
  const filteredArr = allWords.filter((word)=>{
    const length = word.length
    if (length <= 3 && level===GAME_LEVELS.EASY) {
      return word;
    } else if (length >= 4 && length <= 6 && level===GAME_LEVELS.MEDIUM) {
      return word;
    } else if (length > 6 && level===GAME_LEVELS.HARD) {
      return word;
    }
  })
  return res.status(200).json(filteredArr);
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
  getPlayersInRoom,
  deleteRoom,
  quickLeaveRoom,
  getWords
};
