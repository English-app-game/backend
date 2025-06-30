import { RANDOM_WORD_API_URL } from "../../config/consts.js";

export const fetchWordsFromAPI = async (amount) => {
  const response = await fetch(`${RANDOM_WORD_API_URL}?words=${amount}&swear=0`);

  if (!response.ok) {
    throw new Error("Failed to fetch words");
  }

  return await response.json();
};