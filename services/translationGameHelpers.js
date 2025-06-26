const playerColors = ["#ff6b6b", "#4ecdc4", "#45b7d1", "#96ceb4", "#ffeaa7", "#dda0dd", "#ff8c42"];

export const generateRandomColor = (usedColors = []) => {
  const availableColors = playerColors.filter((c) => !usedColors.includes(c));
  if (availableColors.length === 0) {
    return "#000000";
  }
  const index = Math.floor(Math.random() * availableColors.length);
  return availableColors[index];
};
