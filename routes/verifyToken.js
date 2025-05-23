import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { VERIFY_TOKEN_ROUTE } from "./routes_consts.js";

const router = express.Router();

router.get(VERIFY_TOKEN_ROUTE, authMiddleware, (req, res) => {
  res.json({ user: req.user });
});

export default router;
