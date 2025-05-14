import { GameRoomModel } from "../../models/GameRoom.js";

export async function addRoomToDB(roomData) {
  try {
    const newRoom = await GameRoomModel.create(roomData);
    return newRoom;
  } catch (err) {
    console.error("❌ Failed to add room to DB:", err);
    throw new Error("Database insert failed");
  }
}
