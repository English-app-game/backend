export const WAITING_ROOM_EVENTS = {
  JOIN: "join-waiting-room",
  LEAVE: "leave-waiting-room",
  REMOVE: "remove-from-waiting-room",
  PLAYERS_UPDATED: "waiting-room-players-updated",
};

export const TRANSLATION_GAME_EVENTS = {
  JOIN: "join-room",
  LEAVE: "leave-room",
  SET_STATE: "set-translation-game-state",
  START: "start-translation-game",
  END: "end-translation-game",
  SEND_MESSAGE: "send-message",
  RECEIVE_MESSAGE: "receive-message",
  UPDATE_SCORE: "update-score",
  REFERENCE: "reference",
  WORDS_TO_GENERATE: 30,
};

// mock testing data -- end
import { v4 as uuidv4 } from "uuid";

export const WORD_BANK = [
  { heb: "חתול", eng: "cat" },
  { heb: "כלב", eng: "dog" },
  { heb: "עץ", eng: "tree" },
  { heb: "שולחן", eng: "table" },
  { heb: "דג", eng: "fish" },
  { heb: "מחשב", eng: "computer" },
  { heb: "מים", eng: "water" },
  { heb: "ספר", eng: "book" },
  { heb: "כיסא", eng: "chair" },
  { heb: "שמיים", eng: "sky" },
  { heb: "שמש", eng: "sun" },
  { heb: "ירח", eng: "moon" },
  { heb: "כדור", eng: "ball" },
  { heb: "רכב", eng: "car" },
  { heb: "דרך", eng: "road" },
  { heb: "בית", eng: "house" },
  { heb: "חלון", eng: "window" },
  { heb: "דלת", eng: "door" },
  { heb: "לחם", eng: "bread" },
  { heb: "חלב", eng: "milk" },
  { heb: "שוקולד", eng: "chocolate" },
  { heb: "עיפרון", eng: "pencil" },
  { heb: "עט", eng: "pen" },
  { heb: "מיטה", eng: "bed" },
  { heb: "כובע", eng: "hat" },
  { heb: "מעיל", eng: "coat" },
  { heb: "אור", eng: "light" },
  { heb: "צל", eng: "shadow" },
  { heb: "מים", eng: "water" },
  { heb: "מלח", eng: "salt" },
  { heb: "שמן", eng: "oil" },
  { heb: "בצל", eng: "onion" },
  { heb: "גזר", eng: "carrot" },
  { heb: "תפוח", eng: "apple" },
  { heb: "בננה", eng: "banana" },
  { heb: "עוגה", eng: "cake" },
  { heb: "פיצה", eng: "pizza" },
  { heb: "שעון", eng: "clock" },
  { heb: "טלפון", eng: "phone" },
  { heb: "משחק", eng: "game" },
  { heb: "ילד", eng: "boy" },
  { heb: "ילדה", eng: "girl" },
  { heb: "מורה", eng: "teacher" },
  { heb: "כיתה", eng: "classroom" },
  { heb: "עיר", eng: "city" },
  { heb: "כפר", eng: "village" },
  { heb: "שדה", eng: "field" },
  { heb: "ים", eng: "sea" },
  { heb: "חוף", eng: "beach" },
  { heb: "הר", eng: "mountain" },
];

// will later generate data from apis and translations
export function generateWords(count = 5) {
  const shuffled = [...WORD_BANK].sort(() => 0.5 - Math.random());
  const selected = shuffled.slice(0, count);

  return selected.map(({ heb, eng }) => ({
    id: uuidv4(),
    heb: { word: heb, lock: false },
    eng: { word: eng, lock: false },
    disabled: false,
    heldBy: null,
  }));
}

// mock testing data -- end
