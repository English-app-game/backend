import memoryGameState from '../utils/memoryGameState.js';
import { ScoreModel } from '../models/Score.js';

export const initRoom = (roomKey, user) => {
  console.log(`🆕 Initializing room ${roomKey} with user ${user._id}`);
  memoryGameState.rooms.set(roomKey, {
    scoreboard: [{ userId: user._id, score: 0 }],
    gameTypeId: null, // תוכל לשנות אם יש לך טיפוס משחק
  });
  console.log(`📥 Room ${roomKey} initialized with scoreboard:`, memoryGameState.rooms.get(roomKey).scoreboard);
};


// עדכון ניקוד של שחקן בחדר
export const updateScore = (roomKey, userId, points) => {
  console.log(`➡️ Received request to update score for user ${userId} in room ${roomKey} by ${points} points`);

  const roomState = memoryGameState.rooms.get(roomKey);

  if (!roomState) {
    console.warn(`⚠️ Room ${roomKey} not found in memoryGameState`);
    return;
  }

  const userScore = roomState.scoreboard.find((entry) => entry.userId === userId);

  if (userScore) {
    userScore.score += points;
    console.log(`✅ Updated score for user ${userId}: ${userScore.score}`);
  } else {
    roomState.scoreboard.push({ userId, score: points });
    console.log(`🆕 Added new user ${userId} to scoreboard with ${points} points`);
  }

  // מיון לפי ניקוד
  roomState.scoreboard.sort((a, b) => b.score - a.score);
  console.log(`📊 Current scoreboard:`, roomState.scoreboard);
};

// סיום משחק - הכנסת המנצח לטבלת score
export const finalizeScore = async (roomKey) => {
  console.log(`🏁 Finalizing game for room ${roomKey}`);

  const roomState = memoryGameState.rooms.get(roomKey);
  if (!roomState) {
    console.warn(`❌ No room found in memory for key ${roomKey}`);
    return null;
  }

  const winner = roomState.scoreboard[0];
  if (!winner) {
    console.warn(`⚠️ No winner found in scoreboard`);
    return null;
  }

  try {
    const scoreEntry = new ScoreModel({
      player: winner.userId,
      roomId: roomKey,         // שים לב - אם זה ObjectId במונגו תצטרך להמיר
      score: winner.score,
      gameTypeId: roomState.gameTypeId, // תוודא שזה קיים ב-state
    });

    await scoreEntry.save();
    console.log(`🥇 Winner ${winner.userId} with ${winner.score} points saved to DB`);

    return winner;
  } catch (error) {
    console.error(`❌ Error saving winner to DB:`, error);
    return null;
  }
};

// ניקוי חדר מהזיכרון (state בלבד)
export const clearRoom = (roomKey) => {
  console.log(`🧹 Clearing memory for room ${roomKey}`);
  memoryGameState.rooms.delete(roomKey);
  console.log(`✅ Room ${roomKey} removed from memoryGameState`);
};
