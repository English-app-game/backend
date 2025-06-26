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

 const shuffledPairs = [...wordPairs]
    .sort(() => 0.5 - Math.random())
    .slice(0, validCount);

  const cards = [];

  shuffledPairs.forEach(({ he, en }) => {
    const id = generateId();
    cards.push(
      { id, text: he, lang: "he", matched: false, flipped: false },
      { id, text: en, lang: "en", matched: false, flipped: false }
    );
  });
  console.log("Generated cards:", cards);
  console.log("heWords:", cards.filter(c => c.lang === "he"));
  console.log("enWords:", cards.filter(c => c.lang === "en"));

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
    socket.on("memory-game/flip-card", ({ roomKey, userId, cardId, lang }, ack) => {
      console.log("🧠 [SERVER] flip-card received", { roomKey, userId, cardId, lang });
      const game = memoryGames.get(roomKey);
      if (!game) return ack?.({ error: "Room not found" });

      if (game.turn !== userId) {
        return ack?.({ error: "Not your turn" });
      }

      const cardArray = lang === "he" ? game.words.heWords : game.words.enWords;
      const card = cardArray.find((c) => c.id === cardId);

      if (!card) return ack?.({ error: "Card not found" });
      if (card.flipped) return ack?.({ error: "Card already flipped" });
      if (card.matched) return ack?.({ error: "Card already matched" });

      card.flipped = true;
      io.to(roomKey).emit("memory-game/state", game);
      return ack?.({ success: true });


    });

    // checking match between 2 cards
    socket.on("memory-game/match-check", ({ roomKey, userId, firstCard, secondCard }, ack) => {
      const game = memoryGames.get(roomKey);
      if (!game) return ack?.({ error: "Room not found" });

      if (game.turn !== userId) {
        return ack?.({ error: "Not your turn" });
      }

      const cardArray1 = firstCard.lang === 'he' ? game.words.heWords : game.words.enWords;
      const card1 = cardArray1.find(c => c.id === firstCard.id);

      const cardArray2 = secondCard.lang === 'he' ? game.words.heWords : game.words.enWords;
      const card2 = cardArray2.find(c => c.id === secondCard.id);

      if (!card1 || !card2) return ack?.({ error: "Card(s) not found" });
      if (card1.matched || card2.matched) return ack?.({ error: "One or both cards already matched" });

      const isMatch = card1.id === card2.id && card1.lang !== card2.lang;

      if (isMatch) {
        card1.matched = true;
        card2.matched = true;
        card1.flipped = true;
        card2.flipped = true;

        const player = game.users[userId];
        if (player) player.score += 10;

        io.to(roomKey).emit("memory-game/state", game);
      } else {
        setTimeout(() => {
          card1.flipped = false;
          card2.flipped = false;

          const userIds = Object.keys(game.users);
          const currentIndex = userIds.indexOf(userId);
          const nextPlayer = userIds[(currentIndex + 1) % userIds.length];
          game.turn = nextPlayer;

          io.to(roomKey).emit("memory-game/state", game);
        }, 1200);
      }

      // Check for game end
      const allCards = [...game.words.heWords, ...game.words.enWords];
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
