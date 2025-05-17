import express from "express";
import { loginUserController } from "../controllers/authController.js";

const router = express.Router();

router.post("/api/login", loginUserController);


export default router;
