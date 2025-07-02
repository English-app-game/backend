import { generateWords, TRANSLATION_GAME_EVENTS, TRANSLATION_GAME_CONFIG } from "./consts.js";
import { generateRandomColor } from "../services/translationGameHelpers.js";

export default function setupSocketHandlers(io) {
  const rooms = new Map();
  const adapter = io.of("/").adapter;
  const reconnectMap = new Map(); // map<userId:string, timer:Timer>

  // ────── Helpers ──────────────────────────────────────

  const isAppRoom = (room) => !io.sockets.sockets.has(room);

  const createRoomState = () => ({
    roomKey: "",
    users: new Map(),
    host: null,
    scoreboard: [],
    words: [],
    gameTypeId: "",
  });

  const emitRoomState = (roomKey, state) => {
    io.in(roomKey).emit(TRANSLATION_GAME_EVENTS.SET_STATE, {
      ...state,
      users: Object.fromEntries(state.users),
    });
  };

  // ────── Adapter Events ───────────────────────────────

  adapter.on("create-room", (room) => {
    if (!isAppRoom(room) || rooms.has(room)) return;

    rooms.set(room, createRoomState());
    console.log("🆕 App room created:", room);
  });

  adapter.on("join-room", (room, socketId) => {
    if (!isAppRoom(room)) return;

    const state = rooms.get(room);
    // console.log(`✔️  Socket ${socketId} joined ${room} -->`, state);
  });

  adapter.on("leave-room", (room, socketId) => {
    if (!isAppRoom(room)) return;

    const state = rooms.get(room);
    if (!state) return;

    let userIdToRemove = null;
    for (const [userId, user] of state.users) {
      if (user.socketId === socketId) {
        userIdToRemove = userId;
        break;
      }
    }

    if (!userIdToRemove) return console.warn(`⚠️ Could not match socketId ${socketId} to any user`);

    console.log("TIMER INITIALIZED");
    const timer = setTimeout(() => {
      // if user reconnected
      if (!reconnectMap.has(userIdToRemove)) return;

      console.log("THE MAP DOESNT HAVE THE USER TIMER");
      reconnectMap.delete(userIdToRemove);

      state.users.delete(userIdToRemove);

      // release all words held by the user
      for (const w of state.words) {
        if (w.heldBy === userIdToRemove) {
          w.heldBy = null;
          w.lock = false;
        }
      }

      if (state.users.size > 0 && state.host.id === userIdToRemove) {
        const newHost = Array.from(state.users.values())[0];
        state.host = newHost;
      }

      console.log(`❌ Socket ${socketId} (user ${userIdToRemove}) left ${room}`);
      if (!state.end) emitRoomState(room, state);

      if (state.users.size === 0) {
        rooms.delete(room);
        console.log("🗑️ App room deleted (empty):", room);
      } else {
        console.log(`❌ Socket ${socketId} left ${room}`, state.users);
      }
    }, 3000);

    reconnectMap.set(userIdToRemove, timer);
  });

  adapter.on("delete-room", (room) => {
    if (!isAppRoom(room)) return;

    console.log("🗑️ App room deleted:", room);
  });

  // ────── Per-Socket Events ────────────────────────────

  io.on("connection", (socket) => {
    console.log("🔗 ConnectedX:", socket.id);

    socket.on(
      TRANSLATION_GAME_EVENTS.JOIN,
      ({ roomKey, user, gameTypeId, playersAmount, level }) => {
        console.log(`📥 JOIN: Room ${roomKey}, User ${user.name}`);
        console.log(`📥📥📥📥📥📥📥📥📥📥📥📥📥📥📥📥📥📥`);

        const state = rooms.get(roomKey) ?? createRoomState();
        state.roomKey = roomKey;
        console.log(gameTypeId);

        if (reconnectMap.has(user.id)) {
          socket.join(roomKey);
          clearTimeout(reconnectMap.get(user.id));
          reconnectMap.delete(user.id);
          const returningUser = state.users.get(user.id);
          returningUser.socketId = socket.id;
          if (state.host.id === user.id) state.host.socketId = socket.id;
          emitRoomState(roomKey, state);
          return;
        }

        const usedColors = Array.from(state.users.values()).map((u) => u.color);
        const color = generateRandomColor(usedColors);

        const isNewRoom = state.users.size === 0;

        if (isNewRoom) {
          state.host = { socketId: socket.id, ...user };
          state.gameTypeId = gameTypeId;

          console.log(level, playersAmount);
          const [hebWords, engWords] = generateWords(level, playersAmount);
          state.words = [...hebWords, ...engWords];
          state.hebWords = [...hebWords];
          state.enWords = [...engWords];
        }

        state.users.set(user.id, {
          socketId: socket.id,
          ...user,
          score: 0,
          color,
        });

        rooms.set(roomKey, state);
        socket.join(roomKey);

        emitRoomState(roomKey, state);
      }
    );

    socket.on(TRANSLATION_GAME_EVENTS.LEAVE, ({ roomKey }, ack) => {
      socket.leave(roomKey);

      const state = rooms.get(roomKey);
      if (state) {
        emitRoomState(roomKey, state);
      }

      if (typeof ack === "function") ack();
    });

    socket.on("send-message", ({ message }) => {
      console.log(`💬 Message from ${socket.id}: ${message}`);

      io.to(socket.id).emit("receive-message", {
        user: socket.id,
        message,
      });
    });

    socket.on(TRANSLATION_GAME_EVENTS.END_GAME_MESSAGE, ({ roomKey, message }) => {
      console.log("🔚 END GAME MESSAGE", message);
      io.to(roomKey).emit(TRANSLATION_GAME_EVENTS.END_GAME_MESSAGE, {
        message,
      });
    });

    socket.on("lock-word", ({ roomKey, wordId, userId }) => {
      const state = rooms.get(roomKey);
      if (!state) return;

      const word = state.words.find((w) => w.id === wordId);
      if (!word) return;

      // 🚫 Already locked by another user → bail out
      if (word.lock && word.heldBy !== userId) {
        // optional feedback:
        // socket.emit("lock-failed", { wordId, lockedBy: word.heldBy });
        return;
      }

      // ✅ Toggle / acquire
      if (word.heldBy === userId) {
        // user unlocks their own word
        word.heldBy = null;
        word.lock = false;
      } else {
        // release any other word this user holds
        for (const w of state.words) {
          if (w.heldBy === userId) {
            w.heldBy = null;
            w.lock = false;
          }
        }
        // lock the requested word
        word.heldBy = userId;
        word.lock = true;
      }

      io.in(roomKey).emit(TRANSLATION_GAME_EVENTS.SET_STATE, {
        ...state,
        users: Object.fromEntries(state.users),
      });
    });

    socket.on(TRANSLATION_GAME_EVENTS.MATCH_WORD, ({ roomKey, hebrewId, englishId, userId }) => {
      const state = rooms.get(roomKey);
      if (!state) return;

      const hebWord = state.hebWords.find((w) => w.id === hebrewId);
      const engWord = state.enWords.find((w) => w.id === englishId);
      if (!hebWord || !engWord) return;

      const isCorrectMatch = hebWord.id === engWord.id;
      if (isCorrectMatch) {
        hebWord.disabled = true;
        engWord.disabled = true;
        hebWord.heldBy = null;
        hebWord.lock = false;

        const user = state.users.get(userId);
        if (user) {
          user.score += 1;
        }
      } else {
        hebWord.heldBy = null;
        hebWord.lock = false;
      }

      emitRoomState(roomKey, state);

      // 🔚 Check for end game
      const allHebDisabled = state.hebWords.every((w) => w.disabled);
      const allEngDisabled = state.enWords.every((w) => w.disabled);

      if (allHebDisabled && allEngDisabled) {
        state.end = true;
        state.scoreboard = Array.from(state.users.values()).sort((a, b) => b.score - a.score);
        io.in(roomKey).emit(TRANSLATION_GAME_EVENTS.END, {
          message: "🎉 Game over!",
          finalState: {
            ...state,
            users: Object.fromEntries(state.users),
          },
        });
        return;
      }

      socket.emit(TRANSLATION_GAME_EVENTS.MATCH_FEEDBACK, {
        correct: isCorrectMatch,
      });
    });

    socket.on("disconnecting", () => {
      console.log("⚠️ Disconnecting:", socket.id);

      for (const roomKey of socket.rooms) {
        if (roomKey === socket.id) continue;

        socket.leave(roomKey);

        const state = rooms.get(roomKey);
        if (state) {
          io.in(roomKey).emit(TRANSLATION_GAME_EVENTS.SET_STATE, {
            ...state,
            users: Object.fromEntries(state.users),
          });
        }
      }
    });

    socket.on("disconnect", () => {
      console.log("❌ Disconnected:", socket.id);
    });
  });
}
