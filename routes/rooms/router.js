import express from "express";
import { roomController } from "../../controllers/roomController.js";

const router = express.Router();

router.route("/create").post(roomController.addRoomToDB);
router.route("/").get(roomController.getRooms);

export { router };
