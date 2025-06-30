import express from "express";
import { roomController } from "../../controllers/roomController.js";
import {
  DELETE_ROOM_ROUTE,
  GET_ROOM_BY_ID_ROUTE,
  JOIN_ROOM_ROUTE,
  REMOVE_PLAYER_FROM_ROOM_ROUTE,
  START_GAME_ROUTE,
  QUICK_LEAVE_ROUTE,
  GET_WRODS
} from "../../config/consts.js";

const router = express.Router();
const ROOM_ROUTE_BY_KEY = "/check/:key";
const ROOM_ROUTE_PLAYERS_BY_KEY = "/players/:key";

router.route(GET_WRODS).get(roomController.getWords);
router.route("/create").post(roomController.addRoomToDB);
router.route("/").get(roomController.getRooms);
router.route(ROOM_ROUTE_BY_KEY).get(roomController.checkRoomAvailabilityByKey);
router.route(ROOM_ROUTE_PLAYERS_BY_KEY).get(roomController.getRoomWithPlayers);
router.get("/players-in-room/:key", roomController.getPlayersInRoom);
router.route(GET_ROOM_BY_ID_ROUTE).get(roomController.getRoomById);
router.route(REMOVE_PLAYER_FROM_ROOM_ROUTE).delete(roomController.removePlayerFromRoom);
router.route(JOIN_ROOM_ROUTE).post(roomController.addPlayerToRoom);
router.route(START_GAME_ROUTE).patch(roomController.startGame);
router.route(DELETE_ROOM_ROUTE).delete(roomController.deleteRoom);
router.route(QUICK_LEAVE_ROUTE).post(roomController.quickLeaveRoom);
export { router, ROOM_ROUTE_BY_KEY };
