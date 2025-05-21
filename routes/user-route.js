import express from 'express';
import registerController from '../controllers/user-controller.js';
import { REGISTER_ROUTE, RESET_PASSWORD_ROUTE, SET_NEW_PASSWORD } from '../config/consts.js';
import sendResetPasswordEmail from "../services/resetPassword.js";
import { handleResetPassword } from '../controllers/ResetPasswordController.js';

const router = express.Router();

router.post(REGISTER_ROUTE,registerController);
router.post(RESET_PASSWORD_ROUTE, sendResetPasswordEmail);
router.post(SET_NEW_PASSWORD, handleResetPassword);


export default router;