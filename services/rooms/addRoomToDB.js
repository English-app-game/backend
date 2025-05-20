import { GameRoomModel } from "../../models/GameRoom.js";

const MAX_PLAYERS = 5;

export async function addRoomToDB(roomData) {
  const { admin } = roomData;

  if (!admin) {
    throw new Error("Missing admin ID");
  }

  const roomToCreate = {
    ...roomData,
    maxPlayers: MAX_PLAYERS,
    players: [admin],         
    amountOfPlayers: 1      
  };

  try {
    const newRoom = await GameRoomModel.create(roomToCreate);
    return newRoom;
  } catch (err) {
    console.error("❌ Failed to add room to DB:", err);
    throw new Error("Database insert failed");
  }
}
