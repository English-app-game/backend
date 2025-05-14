export function validateCreateRoomFields(roomData) {
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

  return missingFields;
}
