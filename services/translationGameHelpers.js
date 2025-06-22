const playerColors = [
  "#fbbf24",
  "#fb7185", 
  "#c4b5fd", 
  "#4ade80", 
  "#38bdf8", 
];

export const generateRandomColor = (usedColors = []) => {
  const availableColors = playerColors.filter((c) => !usedColors.includes(c));
  if (availableColors.length === 0) {
    return "#000000";
  }
  const index = Math.floor(Math.random() * availableColors.length);
  return availableColors[index];
};
