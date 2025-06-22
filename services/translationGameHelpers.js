const playerColors = ["#fde047", "#fca5a5", "#ddd6fe", "#86efac", "#bae6fd", "#e5e7eb", "#67e8f9"];

export const generateRandomColor = (usedColors = []) => {
  const availableColors = playerColors.filter((c) => !usedColors.includes(c));
  if (availableColors.length === 0) {
    return "#000000";
  }
  const index = Math.floor(Math.random() * availableColors.length);
  return availableColors[index];
};
