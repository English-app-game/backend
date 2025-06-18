const playerColors = [
  "#fde047",
  "#fca5a5",
  "#ddd6fe",
  "#86efac", 
  "#bae6fd", 
  "#e5e7eb", 
  "#67e8f9", 
];

export const generateRandomColor = () => {
  const index = Math.floor(Math.random() * playerColors.length);
  return playerColors[index];
};
