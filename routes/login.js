import express from "express";
import { loginUserController } from "../controllers/authController.js";
import { LOGIN } from "../routes/routes_consts.js"

const router = express.Router();

router.post(LOGIN, loginUserController);


export default router;
