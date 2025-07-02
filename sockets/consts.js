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
  WORDS_TO_GENERATE: 35,
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

export const WORD_BANK = [
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
export function generateWords(count = TRANSLATION_GAME_CONFIG.WORDS_TO_GENERATE) {
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
