export default function setupSocketHandlers(io) {
  // Map<roomKey, { users: Set<socketId>, chat: string[], status: string }>
  const rooms = new Map();
  const adapter = io.of("/").adapter;

  // Helper to ignore the “private” rooms named after each socket.id
  function isAppRoom(room) {
    return !io.sockets.sockets.has(room);
  }

  // Create a fresh room state
  function createRoomState() {
    return {
      roomKey: "",
      users: new Map(),
      // scores
      // hold user state
      // game state : {words: [word: {heb: string, eng:string}, lock:boolean, disabled: boolean}]}
      // toast user to choose heb word first. 
      // update user score at end of game
    };
  }

  // ── Adapter events keep rooms Map in sync ─────────────────────
  adapter.on("create-room", (room) => {
    if (!isAppRoom(room)) return;
    if (!rooms.has(room)) {
      rooms.set(room, createRoomState());
      console.log("🆕 App room created:", room);
    }
  });

  adapter.on("join-room", (room, id) => {
    if (!isAppRoom(room)) return;

    const state = rooms.get(room);
    console.log(`✔️  Socket ${id} joined ${room} --> `, state);
  });

  adapter.on("leave-room", (room, id) => {
    if (!isAppRoom(room)) return;
    const state = rooms.get(room);
    if (!state) return;

    state.users.delete(id);

    if (state.users.size === 0) {
      rooms.delete(room);
      console.log("🗑️ App room deleted (empty):", room);
      console.error(rooms);
    } else {
      console.log(`❌  Socket ${id} left ${room}`, state.users);
    }
  });

  adapter.on("delete-room", (room) => {
    if (!isAppRoom(room) || !rooms.get(room)) return;
    rooms.delete(room);
    console.log("🗑️ App room deleted:", room);
  });

  // ── Per-socket handlers ───────────────────────────────────────
  io.on("connection", (socket) => {
    console.log("🔗 Connected:", socket.id);

    socket.on("join-room", ({ roomKey, user }) => {
      // Add user to rooms cache
      const state = rooms.get(roomKey) || createRoomState();
      state.roomKey = roomKey;
      if (state.users.size === 0) {
        state.users.set(socket.id, user);
        socket.emit("set-room-host");
      } else state.users.set(socket.id, user);

      rooms.set(roomKey, state);
      // join the Socket.IO room (Adapter events handle rooms Map)
      socket.join(roomKey);

      // immediately broadcast the full room state
      // const state = rooms.get(roomKey) || createRoomState();
      io.in(roomKey).emit("room-details", { ...state, users: Object.fromEntries(state.users) });
    });

    socket.on("leave-room", ({ roomKey }, ack) => {
      // leave the Socket.IO room (Adapter will fire its leave-room event)
      socket.leave(roomKey);

      // broadcast updated state to remaining clients
      const state = rooms.get(roomKey);
      if (state) {
        io.in(roomKey).emit("room-details", { ...state, users: Object.fromEntries(state.users) });
      }

      if (typeof ack === "function") ack();
    });

    /** ROOM HANDLERS START */
    // socket.on("reference", ({ _ }) => {
    // const state = rooms.get(roomKey);
    // state.video = video;
    //   io.in(roomKey).emit("reference", {_ });
    // });

    socket.on("send-message", ({ message }) => {
      console.log(`💬 Message from ${socket.id}: ${message}`);

      io.emit("receive-message", {
        user: socket.id,
        message,
      });
    });
    /** ROOM HANDLERS END */

    socket.on("disconnecting", () => {
      console.log("⚠️  Disconnecting:", socket.id);
      // Adapter will handle the leave-room/delete-room events automatically

      // If user exits the browser tab then leave-room would not be fired, so the same code to emit to everyone in the room that users changed should be here aswell.

      for (const roomKey of socket.rooms) {
        // if the room is user's socket
        if (roomKey === socket.id) continue;

        // this'll update the rooms state in cache
        socket.leave(roomKey);

        // broadcast updated state to remaining clients
        const state = rooms.get(roomKey);
        if (state) {
          io.in(roomKey).emit("update-room", { ...state, users: Object.fromEntries(state.users) });
        }
      }
    });

    socket.on("disconnect", () => {
      console.log("❌ Disconnected:", socket.id);
    });
  });
}
