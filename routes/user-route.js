import express from 'express';
import registerController from '../controllers/user-controller.js';
import { REGISTER_ROUTE } from '../config/consts.js';

const router = express.Router();

router.post(REGISTER_ROUTE,registerController);

export default router;