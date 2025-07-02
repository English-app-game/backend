export const WAITING_ROOM_EVENTS = {
  JOIN: "join-waiting-room",
  LEAVE: "leave-waiting-room",
  REMOVE: "remove-from-waiting-room",
  PLAYERS_UPDATED: "waiting-room-players-updated",
  HOST_LEFT: "host-left",
  ROOM_CLOSED: "room-closed",
};

export const WAITING_ROOM_TIMEOUTS = {
  HOST_RECONNECTION_GRACE_PERIOD: 3000, // 3 seconds
  HOST_LEFT_GRACE_PERIOD: 3000, // 3 seconds
  TEMP_DISCONNECTION_TIMEOUT: 5000, // 5 seconds
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
  END_GAME_MESSAGE: "translation-game/end-game-message",
};

export const TRANSLATION_GAME_CONFIG = {
  // MUST choose a prime number in order to avoid a game tie scenario.
  WORDS_TO_GENERATE: 11,
};

export const MEMORY_GAME_EVENTS = {
  JOIN: "memory-game/join",
  STATE: "memory-game/state",
  PLAYER_LEFT: "memory-game/player-left",
  FLIP_CARD: "memory-game/flip-card",
  MATCH_CHECK: "memory-game/match-check",
  DISCONNECT: "disconnect",
  CONNECTION: "connection",
  END: "memory-game/end",
};

// mock testing data -- end
import { v4 as uuidv4 } from "uuid";

export const WORD_BANK = {
  easy: [
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
    { heb: "עיפרון", eng: "pencil" },
    { heb: "עט", eng: "pen" },
    { heb: "מיטה", eng: "bed" },
    { heb: "כובע", eng: "hat" },
    { heb: "מעיל", eng: "coat" },
    { heb: "אור", eng: "light" },
    { heb: "צל", eng: "shadow" },
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
    { heb: "שוקולד", eng: "chocolate" },
    { heb: "תיק", eng: "bag" },
    { heb: "סוכר", eng: "sugar" },
  ],
  medium: [
    { heb: "משקפיים", eng: "glasses" },
    { heb: "מזגן", eng: "air conditioner" },
    { heb: "תחנה", eng: "station" },
    { heb: "עיתון", eng: "newspaper" },
    { heb: "מדרכה", eng: "sidewalk" },
    { heb: "אוזניות", eng: "headphones" },
    { heb: "צבע", eng: "paint" },
    { heb: "מסעדה", eng: "restaurant" },
    { heb: "חנות", eng: "shop" },
    { heb: "עכבר", eng: "mouse" },
    { heb: "מקלדת", eng: "keyboard" },
    { heb: "טלוויזיה", eng: "television" },
    { heb: "עוגייה", eng: "cookie" },
    { heb: "סנדוויץ'", eng: "sandwich" },
    { heb: "מטוס", eng: "airplane" },
    { heb: "רכבת", eng: "train" },
    { heb: "אונייה", eng: "ship" },
    { heb: "אוטובוס", eng: "bus" },
    { heb: "צלחת", eng: "plate" },
    { heb: "מזלג", eng: "fork" },
    { heb: "סכין", eng: "knife" },
    { heb: "כף", eng: "spoon" },
    { heb: "קומקום", eng: "kettle" },
    { heb: "קומה", eng: "floor" },
    { heb: "מרפסת", eng: "balcony" },
    { heb: "גרביים", eng: "socks" },
    { heb: "נעליים", eng: "shoes" },
    { heb: "חולצה", eng: "shirt" },
    { heb: "מכנסיים", eng: "pants" },
    { heb: "חצאית", eng: "skirt" },
    { heb: "תיק גב", eng: "backpack" },
    { heb: "גינה", eng: "garden" },
    { heb: "שכן", eng: "neighbor" },
    { heb: "שלט", eng: "sign" },
    { heb: "כרטיס", eng: "ticket" },
    { heb: "קיץ", eng: "summer" },
    { heb: "אביב", eng: "spring" },
    { heb: "סתיו", eng: "autumn" },
    { heb: "חורף", eng: "winter" },
    { heb: "טפט", eng: "wallpaper" },
    { heb: "גשר", eng: "bridge" },
    { heb: "מנהרה", eng: "tunnel" },
    { heb: "ספסל", eng: "bench" },
    { heb: "כביסה", eng: "laundry" },
    { heb: "מדיח", eng: "dishwasher" },
    { heb: "סוללה", eng: "battery" },
    { heb: "קולנוע", eng: "cinema" },
    { heb: "מקרר", eng: "refrigerator" },
    { heb: "שמיכה", eng: "blanket" },
  ],
  hard: [
    { heb: "השתקפות", eng: "reflection" },
    { heb: "התמודדות", eng: "coping" },
    { heb: "התלבטות", eng: "hesitation" },
    { heb: "פתרון", eng: "solution" },
    { heb: "התפתחות", eng: "development" },
    { heb: "חווייה", eng: "experience" },
    { heb: "המלצה", eng: "recommendation" },
    { heb: "התאוששות", eng: "recovery" },
    { heb: "הסתגלות", eng: "adaptation" },
    { heb: "התמדה", eng: "perseverance" },
    { heb: "אחריות", eng: "responsibility" },
    { heb: "השראה", eng: "inspiration" },
    { heb: "הישג", eng: "achievement" },
    { heb: "פירוש", eng: "interpretation" },
    { heb: "ציפייה", eng: "expectation" },
    { heb: "התאכזבות", eng: "disappointment" },
    { heb: "הפתעה", eng: "surprise" },
    { heb: "התפעלות", eng: "admiration" },
    { heb: "התחייבות", eng: "commitment" },
    { heb: "השוואה", eng: "comparison" },
    { heb: "התייעצות", eng: "consultation" },
    { heb: "השתקפות", eng: "reflection" },
    { heb: "התרגשות", eng: "excitement" },
    { heb: "התרשמות", eng: "impression" },
    { heb: "התחייבות", eng: "commitment" },
    { heb: "התעוררות", eng: "awakening" },
    { heb: "הסתייגות", eng: "reservation" },
    { heb: "פיצוי", eng: "compensation" },
    { heb: "התרסה", eng: "defiance" },
    { heb: "הסתגרות", eng: "isolation" },
    { heb: "הסתייגות", eng: "reservation" },
    { heb: "הזדהות", eng: "identification" },
    { heb: "התרפקות", eng: "nostalgia" },
    { heb: "השתדלות", eng: "effort" },
    { heb: "התעקשות", eng: "insistence" },
    { heb: "התרשלות", eng: "negligence" },
    { heb: "התמודדות", eng: "struggle" },
    { heb: "התנגדות", eng: "opposition" },
    { heb: "הערכה", eng: "appreciation" },
    { heb: "הסכמה", eng: "agreement" },
    { heb: "התפשרות", eng: "compromise" },
    { heb: "התלבטות", eng: "dilemma" },
    { heb: "התעקשות", eng: "persistence" },
    { heb: "השקעה", eng: "investment" },
    { heb: "השתייכות", eng: "affiliation" },
    { heb: "התנצלות", eng: "apology" },
    { heb: "התקדמות", eng: "progress" },
    { heb: "התחייבות", eng: "obligation" },
    { heb: "הסתפקות", eng: "contentment" },
  ],
};

const WORDS_PER_LEVEL = {
  easy: 6,
  medium: 8,
  hard: 10,
};

const shuffleArray = (arr) => {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

export function generateWords(level = "easy", playerCount = 2) {
  const count = (WORDS_PER_LEVEL[level] || WORDS_PER_LEVEL.easy) * playerCount;
  const wordList = WORD_BANK[level] || WORD_BANK.easy;

  const shuffled = shuffleArray(wordList);
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
