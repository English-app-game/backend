import { addRoomToDB as addRoomToDbService } from "../services/rooms/addRoomToDB.js";
import { validateCreateRoomFields } from "../utils/validateCreateRoomFields.js";
import {GameRoomModel} from "../models/GameRoom.js";

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

export const roomController = {
  addRoomToDB,
  getRooms,
};
