// backend/sockets/handlers/memoryGameHandlers.js
import { Server } from "socket.io";
import { MEMORY_GAME_EVENTS } from "../sockets/consts.js";

const rooms = new Map();

export function setupMemoryGameHandlers(io) {
  io.on("connection", (socket) => {
    console.log("🧠 Memory Game | Connected:", socket.id);

    socket.on(MEMORY_GAME_EVENTS.START, ({ roomKey, players }) => {
    console.log("📥 START received!", roomKey, players);
      rooms.set(roomKey, {
        currentTurn: players[0]?._id,
        players,
        scores: {},
      });

      io.in(roomKey).emit(MEMORY_GAME_EVENTS.TURN_CHANGED, players[0]?._id);
    });

    socket.on(MEMORY_GAME_EVENTS.PLAYER_SCORED, ({ roomKey, userId }) => {
      const state = rooms.get(roomKey);
      if (!state) return;

      state.scores[userId] = (state.scores[userId] || 0) + 1;
      io.in(roomKey).emit(MEMORY_GAME_EVENTS.SCORE_UPDATED, state.scores);
    });

    socket.on(MEMORY_GAME_EVENTS.TURN_ENDED, ({ roomKey }) => {
      const state = rooms.get(roomKey);
      if (!state) return;

      const { players, currentTurn } = state;
      const currentIndex = players.findIndex((p) => p.id === currentTurn);
      const nextIndex = (currentIndex + 1) % players.length;
      const nextPlayer = players[nextIndex];

      state.currentTurn = nextPlayer.id;
      io.in(roomKey).emit(MEMORY_GAME_EVENTS.TURN_CHANGED, nextPlayer.id);
    });

    socket.on("disconnect", () => {
      console.log("🧠 Memory Game | Disconnected:", socket.id);
    });
  });
}
