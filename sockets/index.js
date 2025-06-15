import { generateWords, TRANSLATION_GAME_EVENTS } from "./consts.js";
import { generateRandomColor } from "../services/translationGameHelpers.js";

export default function setupSocketHandlers(io) {
  const rooms = new Map();
  const adapter = io.of("/").adapter;

  // ────── Helpers ──────────────────────────────────────

  const isAppRoom = (room) => !io.sockets.sockets.has(room);

  const createRoomState = () => ({
    roomKey: "",
    users: new Map(),
    host: null,
    scoreboard: [{}],
    words: [],
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
    console.log(`✔️  Socket ${socketId} joined ${room} -->`, state);
  });

  adapter.on("leave-room", (room, socketId) => {
    if (!isAppRoom(room)) return;

    const state = rooms.get(room);
    if (!state) return;

    state.users.delete(socketId);

    if (state.users.size === 0) {
      rooms.delete(room);
      console.log("🗑️ App room deleted (empty):", room);
    } else {
      console.log(`❌ Socket ${socketId} left ${room}`, state.users);
    }
  });

  adapter.on("delete-room", (room) => {
    if (!isAppRoom(room)) return;

    rooms.delete(room);
    console.log("🗑️ App room deleted:", room);
  });

  // ────── Per-Socket Events ────────────────────────────

  io.on("connection", (socket) => {
    console.log("🔗 Connected:", socket.id);

    socket.on(TRANSLATION_GAME_EVENTS.JOIN, ({ roomKey, user }) => {
      console.log(`📥 JOIN: Room ${roomKey}, User ${user.name}`);

      const state = rooms.get(roomKey) ?? createRoomState();
      state.roomKey = roomKey;

      const color = generateRandomColor();
      const isNewRoom = state.users.size === 0;

      if (isNewRoom) {
        state.host = { socketId: socket.id, ...user };

        state.words = generateWords(TRANSLATION_GAME_EVENTS.WORDS_TO_GENERATE);
      }

      state.users.set(user.id, {
        socketId: socket.id,
        ...user,
        score: 0,
        color,
      });

      socket.join(roomKey);
      rooms.set(roomKey, state);

      emitRoomState(roomKey, state);
    });

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

    socket.on("disconnecting", () => {
      console.log("⚠️ Disconnecting:", socket.id);

      for (const roomKey of socket.rooms) {
        if (roomKey === socket.id) continue;

        socket.leave(roomKey);

        const state = rooms.get(roomKey);
        if (state) {
          io.in(roomKey).emit("set-translation-game-state", {
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

// import { generateWords, TRANSLATION_GAME_EVENTS } from "./consts.js";

// export default function setupSocketHandlers(io) {
//   // Map<roomKey, { users: Set<socketId>, chat: string[], status: string }>
//   const rooms = new Map();
//   const adapter = io.of("/").adapter;

//   // Helper to ignore the “private” rooms named after each socket.id
//   function isAppRoom(room) {
//     return !io.sockets.sockets.has(room);
//   }

//   // Create a fresh room state
//   function createRoomState() {
//     return {
//       roomKey: "",
//       users: new Map(), // Map<userId, { socketId: string, name: string, id: string, email:string, avatarImg:string, color:string }>
//       host: null, // {socketId: string, user},
//       scoreboard: [{}], // [{userId: string, name:string, , score: number }].sort(from highest to lowest score)
//       words: [], // { id:string, heb: {word:string, lock:boolean}, eng:{word:string, lock:boolean}, disabled:boolean, heldBy: string(user.id) | null }
//     };
//   }
//   // toast user to choose heb word first.

//   // ── Adapter events keep rooms Map in sync ─────────────────────
//   adapter.on("create-room", (room) => {
//     if (!isAppRoom(room)) return;
//     if (!rooms.has(room)) {
//       rooms.set(room, createRoomState());
//       console.log("🆕 App room created:", room);
//     }
//   });

//   adapter.on("join-room", (room, id) => {
//     if (!isAppRoom(room)) return;

//     const state = rooms.get(room);
//     console.log(`✔️  Socket ${id} joined ${room} --> `, state);
//   });

//   adapter.on("leave-room", (room, id) => {
//     if (!isAppRoom(room)) return;
//     const state = rooms.get(room);
//     if (!state) return;

//     state.users.delete(id);

//     if (state.users.size === 0) {
//       rooms.delete(room);
//       console.log("🗑️ App room deleted (empty):", room);
//       console.error(rooms);
//     } else {
//       console.log(`❌  Socket ${id} left ${room}`, state.users);
//     }
//   });

//   adapter.on("delete-room", (room) => {
//     if (!isAppRoom(room) || !rooms.get(room)) return;
//     rooms.delete(room);
//     console.log("🗑️ App room deleted:", room);
//   });

//   // ── Per-socket handlers ───────────────────────────────────────
//   io.on("connection", (socket) => {
//     console.log("🔗 Connected:", socket.id);

//     socket.on(TRANSLATION_GAME_EVENTS.JOIN, ({ roomKey, user }) => {
//       console.log(roomKey, user);
//       // Add user to rooms cache
//       const state = rooms.get(roomKey) || createRoomState();
//       state.roomKey = roomKey;
//       const color =
//         "#" +
//         Math.floor(Math.random() * 16777215)
//           .toString(16)
//           .padStart(6, "0");

//       // this means that the room is right now create so needs to be initialized
//       if (state.users.size === 0) {
//         state.host = { socketId: socket.id, ...user };
//         state.words = generateWords(10); // or any number you want
//       }
//       state.users.set(user.id, { socketId: socket.id, ...user, score: 0, color });

//       rooms.set(roomKey, state);
//       // join the Socket.IO room (Adapter events handle rooms Map)
//       socket.join(roomKey);

//       // immediately broadcast the full room state
//       // const state = rooms.get(roomKey) || createRoomState();
//       io.in(roomKey).emit(TRANSLATION_GAME_EVENTS.SET_STATE, {
//         ...state,
//         users: Object.fromEntries(state.users),
//       });
//     });

//     socket.on(TRANSLATION_GAME_EVENTS.LEAVE, ({ roomKey }, ack) => {
//       // leave the Socket.IO room (Adapter will fire its leave-room event)
//       socket.leave(roomKey);

//       // broadcast updated state to remaining clients
//       const state = rooms.get(roomKey);
//       if (state) {
//         io.in(roomKey).emit(TRANSLATION_GAME_EVENTS.SET_STATE, {
//           ...state,
//           users: Object.fromEntries(state.users),
//         });
//       }

//       if (typeof ack === "function") ack();
//     });

//     /** ROOM HANDLERS START */

//     socket.on("send-message", ({ message }) => {
//       console.log(`💬 Message from ${socket.id}: ${message}`);

//       io.to(socket.id).emit("receive-message", {
//         user: socket.id,
//         message,
//       });
//     });
//     /** ROOM HANDLERS END */

//     socket.on("disconnecting", () => {
//       console.log("⚠️  Disconnecting:", socket.id);
//       // Adapter will handle the leave-room/delete-room events automatically

//       // If user exits the browser tab then leave-room would not be fired, so the same code to emit to everyone in the room that users changed should be here aswell.

//       for (const roomKey of socket.rooms) {
//         // if the room is user's socket
//         if (roomKey === socket.id) continue;

//         // this'll update the rooms state in cache
//         socket.leave(roomKey);

//         // broadcast updated state to remaining clients
//         const state = rooms.get(roomKey);
//         if (state) {
//           io.in(roomKey).emit("set-translation-game-state", {
//             ...state,
//             users: Object.fromEntries(state.users),
//           });
//         }
//       }
//     });

//     socket.on("disconnect", () => {
//       console.log("❌ Disconnected:", socket.id);
//     });
//   });
// }
