import express from "express";
import { roomController } from "../../controllers/roomController.js";

const router = express.Router();
const ROOM_ROUTE_BY_KEY = "/check/:key";
const ROOM_ROUTE_PLAYERS_BY_KEY = "/players/:key";


router.route("/create").post(roomController.addRoomToDB);
router.route("/").get(roomController.getRooms);
router.route(ROOM_ROUTE_BY_KEY).get(roomController.checkRoomAvailabilityByKey);
router.route(ROOM_ROUTE_PLAYERS_BY_KEY).get(roomController.getRoomWithPlayers);



export { router, ROOM_ROUTE_BY_KEY };

