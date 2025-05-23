export function validateCreateRoomFields(roomData) {
  const requiredFields = [
  "key",
  "admin",
  "gameType",
  "isActive",
  "currentStatus",
  ];

  const missingFields = requiredFields.filter((field) => !(field in roomData));

  return missingFields;
}
