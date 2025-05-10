import express from 'express';
import userController from '../controllers/user-controller';

const router = express.Router();

router.route('register').post(userController.registerController);

export default router;