import express from 'express';
import {
  initRoom,  
  updateScore,
  finalizeScore,
  clearRoom
} from '../controllers/memoryGameController.js';

const router = express.Router();

router.post('/init-room', (req, res) => {
  const { roomKey, user } = req.body;
  console.log(`🔧 /init-room endpoint hit with`, req.body);
  if (!roomKey || !user || !user._id) {
    return res.status(400).json({ message: "Missing roomKey or user" });
  }

  initRoom(roomKey, user);
  res.status(200).json({ message: "Room initialized" });
});

router.post('/update-score', (req, res) => {
  const { roomKey, userId, points } = req.body;
  console.log(`🔄 /update-score endpoint hit with`, req.body);
  updateScore(roomKey, userId, points);
  res.status(200).json({ message: 'Score updated' });
});

router.post('/finalize-score', async (req, res) => {
  const { roomKey } = req.body;
  console.log(`🚨 /finalize-score endpoint hit with`, req.body);
  const winner = await finalizeScore(roomKey);
  if (winner) {
    res.status(200).json({ message: 'Game finished', winner });
  } else {
    res.status(404).json({ message: 'Room not found or game already finalized' });
  }
});

router.post('/clear-room', (req, res) => {
  const { roomKey } = req.body;
  console.log(`🗑️ /clear-room endpoint hit with`, req.body);
  clearRoom(roomKey);
  res.status(200).json({ message: 'Room cleared' });
});

export default router;
