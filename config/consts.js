import dotenv from "dotenv";

dotenv.config();

export const MAX_RETRIES = 5;
export const RETRY_DELAY_MS = 5000;
export const PORT = process.env.PORT || 3000;
export const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";
export const MONGO_URI = process.env.MONGO_URI || null;
export const REGISTER_ROUTE = "/register";
export const RESET_PASSWORD_ROUTE = "/login/resetPassword";
export const SET_NEW_PASSWORD = "/resetPassword";
export const USERS_ROUTE = "/api/users";
export const ROOMS_ROUTE = "/api/rooms";
export const STATISTICS_ROUTE = "/api/statistics";
export const NODEMAILER_EMAIL = process.env.EMAIL;
export const NODEMAILER_PASSWORD = process.env.EMAIL_PASSWORD;
export const MAX_PLAYERS = 5;
export const SALT_ROUNDS = 10;
export const GAMETYPE_ROUTE = "/api/game-types";
export const GET_ROOM_BY_ID_ROUTE = `/:id`;
export const JOIN_ROOM_ROUTE = `/players/join`;
export const REMOVE_PLAYER_FROM_ROOM_ROUTE = `/players/remove`;
export const SCORE_ROUTE= "/api/score";
export const GET_LAST_SCORE_ROUTE = "/last/:playerId";
export const SAVE_SCORE_ROUTE = "/save";
export const START_GAME_ROUTE = `/:id/start`;
export const DELETE_ROOM_ROUTE = '/:id';
export const QUICK_LEAVE_ROUTE = '/quick-leave';
export const GET_WRODS = '/words';
export const RANDOM_WORD_API_URL = "https://random-word-api.vercel.app/api";

