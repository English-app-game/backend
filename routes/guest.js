import express from "express";
import { v4 as uuidv4 } from "uuid";
import { createToken } from "../utils/jwt.js";

const router = express.Router();

router.post("/api/guest", (req, res) => {
  const { name, avatarImg } = req.body;

  if (!name || !avatarImg) {
    return res.status(400).json({ error: "Name and avatar are required" });
  }

  const token = createToken({
    id: uuidv4(),
    name,
    avatarImg,
    isGuest: true,
  }, "1h");

  res.json({ token, user: { name, avatarImg, isGuest: true } });
});

export default router;