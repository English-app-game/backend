import express from 'express';
import registerController from '../controllers/user-controller.js';
import { REGISTER_ROUTE, RESET_PASSWORD_ROUTE } from '../config/consts.js';
import sendResetPasswordEmail from "../controllers/ResetPasswordController.js";

const router = express.Router();

router.post(REGISTER_ROUTE,registerController);
router.post(RESET_PASSWORD_ROUTE, sendResetPasswordEmail);


export default router;