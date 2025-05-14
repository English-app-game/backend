import { addRoomToDB as addRoomToDbService } from "../services/rooms/addRoomToDB.js";

async function addRoomToDB(req, res) {
  try {
    console.log(req.body);
    const roomData = req.body;
    if (!roomData) {
      return res.status(400).json({
        error: `No Room Data passed!`,
      });
    }

    // ✅ Validate all required fields based on frontend-controlled structure
    const requiredFields = [
      "key",
      "level",
      "maxPlayers",
      "players",
      "gameType",
      "isActive",
      "admin",
      "currentStatus",
      "createdAt",
      "chat",
      "amountOfPlayers",
    ];

    const missingFields = requiredFields.filter((field) => !(field in roomData));

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

export const roomController = {
  addRoomToDB,
};
