export const WAITING_ROOM_EVENTS = {
  JOIN: "join-waiting-room",
  LEAVE: "leave-waiting-room",
  REMOVE: "remove-from-waiting-room",
  PLAYERS_UPDATED: "waiting-room-players-updated",
  HOST_LEFT: "host-left",
  ROOM_CLOSED: "room-closed",
};

export const WAITING_ROOM_TIMEOUTS = {
  HOST_RECONNECTION_GRACE_PERIOD: 3000,  // 3 seconds
  HOST_LEFT_GRACE_PERIOD: 3000,          // 3 seconds
  TEMP_DISCONNECTION_TIMEOUT: 5000,      // 5 seconds
};

export const TRANSLATION_GAME_EVENTS = {
  JOIN: "translation-game/join",
  LEAVE: "translation-game/leave",
  SET_STATE: "translation-game/set-state",
  START: "translation-game/start",
  END: "translation-game/end",
  SEND_MESSAGE: "translation-game/send-message",
  RECEIVE_MESSAGE: "translation-game/receive-message",
  UPDATE_SCORE: "translation-game/update-score",
  MATCH_WORD: "translation-game/match-word",
  MATCH_FEEDBACK: "translation-game/match-feedback",
};

export const TRANSLATION_GAME_CONFIG = {
  WORDS_TO_GENERATE: 5,
};

// export const MEMORY_GAME_EVENTS = {
//   JOIN: "memory-game/join",
//   START: "memory-game/start",
//   PLAYER_SCORED: "memory-game/player-scored",
//   TURN_CHANGED: "memory-game/turn-changed",
//   TURN_ENDED: "memory-game/turn-ended",
//   END: "memory-game/end"
// };

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

const shuffleArray = (arr) => {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

// will later generate data from apis and translations
export function generateWords(count = 5) {
  const shuffled = [...WORD_BANK].sort(() => 0.5 - Math.random());
  const selected = shuffled.slice(0, count);

  const hebWords = [];
  const engWords = [];

  selected.forEach(({ heb, eng }) => {
    const id = uuidv4();
    engWords.push({ id, word: eng, disabled: false, heldBy: null, lock: false });
    hebWords.push({ id, word: heb, disabled: false, heldBy: null, lock: false });
  });

  return [shuffleArray(hebWords), shuffleArray(engWords)];
}

// mock testing data -- end
