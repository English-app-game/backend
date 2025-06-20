// generates id for the cards
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
}

const memoryGames = new Map();

function generateMemoryCards(count = 10) {
  const wordPairs = [
    { he: "חתול", en: "cat" },
    { he: "כלב", en: "dog" },
    { he: "עץ", en: "tree" },
    { he: "ספר", en: "book" },
    { he: "מים", en: "water" },
    { he: "שולחן", en: "table" },
    { he: "שמיים", en: "sky" },
    { he: "ירח", en: "moon" },
    { he: "כיסא", en: "chair" },
    { he: "דלת", en: "door" },
    { he: "אור", en: "light" },
    { he: "מחשב", en: "computer" },
    { he: "ילד", en: "boy" },
    { he: "ילדה", en: "girl" },
    { he: "רכב", en: "car" },
    { he: "עוגה", en: "cake" },
    { he: "טלפון", en: "phone" },
    { he: "חלון", en: "window" },
    { he: "כובע", en: "hat" },
    { he: "פיצה", en: "pizza" },
  ];

 const validCount = Math.min(count, wordPairs.length);

 const shuffled = [...wordPairs]
    .sort(() => 0.5 - Math.random())
    .slice(0, validCount);

  const cards = [];

  shuffled.forEach(({ he, en }) => {
    const id = generateId();
    cards.push(
      { id, text: he, lang: "he", matched: false, flipped: false },
      { id, text: en, lang: "en", matched: false, flipped: false }
    );
  });

  return cards.sort(() => 0.5 - Math.random());
}

//listens to the game's events
export function setupMemoryGame(io) {
  io.on('connection', (socket) => {
  
 console.log("🔌 New socket connected:", socket.id);

 socket.on("memory-game/join", ({ roomKey, user }) => {
 console.log("🧠 [JOIN] user joined room:", roomKey, "user:", user);

  let game = memoryGames.get(roomKey);

  if (!game) {
    const cards = generateMemoryCards();
    game = {
      roomKey,
      users: {},
      score: 0,
      words: {
        heWords: cards.filter(c => c.lang === "he"),
        enWords: cards.filter(c => c.lang === "en")
      },
      host: user,
      turn: user.id,
    };
    
    memoryGames.set(roomKey, game);
    console.log("📦 [JOIN] New game created and saved:", game);
    console.log("🆕 Game created:", JSON.stringify(game, null, 2));
   
  }

  console.log("📦 [JOIN] New game created and saved:", game);

// if the game exist but doesnt have cards- generates cards
  if (!game.words?.heWords?.length || !game.words?.enWords?.length) {
    const cards = generateMemoryCards();
    game.words = {
      heWords: cards.filter(c => c.lang === "he"),
      enWords: cards.filter(c => c.lang === "en")
    };
    console.log("🔁 Refilled empty words for existing game:", JSON.stringify(game.words, null, 2));
  }

//adding user to the game
  game.users[user.id] = {
    ...user,
    socketId: socket.id,
    score: 0
  };

  socket.join(roomKey);
  console.log("📤 Emitting state to room:", JSON.stringify(game, null, 2)); 
  io.to(roomKey).emit("memory-game/state", game);
  console.log("📤 Emitting state to room:", JSON.stringify(game, null, 2)); 

});

    // validation for flip card
    socket.on("memory-game/flip-card", ({ roomKey, userId, cardId }, ack) => {
      console.log("🧠 [SERVER] flip-card received", roomKey, userId, cardId);
      const game = memoryGames.get(roomKey);
      if (!game) return ack?.({ error: "Room not found" });

      if (game.turn !== userId) {
        return ack?.({ error: "Not your turn" });
      }

      let card = game.words.heWords.find((c) => c.id === cardId);
      if (!card) card = game.words.enWords.find((c) => c.id === cardId);
      if (card.flipped) return ack?.({ error: "Card already flipped" });
      if (card.matched) return ack?.({ error: "Card already matched" });

      card.flipped = true;
      io.to(roomKey).emit("memory-game/state", game);
      return ack?.({ success: true });


    });

    // checking match between 2 cards
    socket.on("memory-game/match-check", ({ roomKey, userId, firstCardId, secondCardId }, ack) => {
  const game = memoryGames.get(roomKey);
  if (!game) return ack?.({ error: "Room not found" });

  if (game.turn !== userId) return ack?.({ error: "Not your turn" });

  const allCards = [...game.words.heWords, ...game.words.enWords];
  const first = allCards.find((c) => c.id === firstCardId);
  const second = allCards.find((c) => c.id === secondCardId);

  if (!first || !second) return ack?.({ error: "Card(s) not found" });
  if (first.matched || second.matched) return ack?.({ error: "One or both cards already matched" });

  const isMatch = first.id === second.id && first !== second;

  if (isMatch) {
    first.matched = true;
    second.matched = true;
    first.flipped = true;
    second.flipped = true;

    const player = game.users[userId];
    if (player) player.score += 1;

    game.score = (game.score || 0) + 1;

    io.to(roomKey).emit("memory-game/state", game);
  } else {
    // ❗ מוסיפים השהייה כדי להראות את הקלפים לפני Flip-Back
    setTimeout(() => {
      first.flipped = false;
      second.flipped = false;

      // שליחת הפקודה להפוך חזרה
      console.log("Before flip- back");
      io.to(roomKey).emit("memory-game/flip-back", {
        firstCardId,
        secondCardId
      });

      console.log("After flip- back and replace turn");
      // החלפת תור
      const userIds = Object.keys(game.users);
      const currentIndex = userIds.indexOf(userId);
      const nextPlayer = userIds[(currentIndex + 1) % userIds.length];
      game.turn = nextPlayer;

      io.to(roomKey).emit("memory-game/state", game);
    }, 1200);
  }

  // בדיקה אם סיום משחק
  const allMatched = allCards.every((c) => c.matched);
  if (allMatched) {
    io.to(roomKey).emit("memory-game/end", {
      winners: Object.values(game.users).sort((a, b) => b.score - a.score),
      finalScore: game.score
    });
    memoryGames.delete(roomKey);
  }

  ack?.({ success: true, match: isMatch });
});
  });
}
