import express from "express";
import { roomController } from "../../controllers/roomController.js";
import {
  GET_ROOM_BY_ID_ROUTE,
  JOIN_ROOM_ROUTE,
  REMOVE_PLAYER_FROM_ROOM_ROUTE,
} from "../../config/consts.js";

const router = express.Router();
const ROOM_ROUTE_BY_KEY = "/check/:key";
const ROOM_ROUTE_PLAYERS_BY_KEY = "/players/:key";

router.route("/create").post(roomController.addRoomToDB);
router.route("/").get(roomController.getRooms);
router.route(ROOM_ROUTE_BY_KEY).get(roomController.checkRoomAvailabilityByKey);
router.route(ROOM_ROUTE_PLAYERS_BY_KEY).get(roomController.getRoomWithPlayers);
router.route(GET_ROOM_BY_ID_ROUTE).get(roomController.getRoomById);
router.route(REMOVE_PLAYER_FROM_ROOM_ROUTE).delete(roomController.removePlayerFromRoom);
router.route(JOIN_ROOM_ROUTE).post(roomController.addPlayerToRoom);

export { router, ROOM_ROUTE_BY_KEY };
