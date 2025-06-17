import { WAITING_ROOM_EVENTS } from "./consts.js";
import { GAME_ROOM_STATUS } from "../models/statuses.js";
import { GameRoomModel } from "../models/GameRoom.js";

export function setupWaitingRoomSocketHandlers(io) {
  const waitingRooms = new Map();
  const deletedRoomKeys = new Set();

  async function safelyDeleteRoom(roomKey) {
    if (deletedRoomKeys.has(roomKey)) return;
    deletedRoomKeys.add(roomKey);

    io.in(roomKey).emit(WAITING_ROOM_EVENTS.ROOM_CLOSED);
    const sockets = await io.in(roomKey).fetchSockets();
    sockets.forEach((s) => s.leave(roomKey));
    waitingRooms.delete(roomKey);

    try {
      await GameRoomModel.findOneAndDelete({ key: roomKey });
      console.log(`🗑️ Room ${roomKey} deleted from DB`);
    } catch (err) {
      console.error("❌ DB deletion failed:", err);
    }
  }

  async function isWaitingRoom(roomKey) {
    try {
      const room = await GameRoomModel.findOne({ key: roomKey });
      if (!room) {
        console.log(`🔍 Room ${roomKey} not found in database`);
        return false;
      }
      
      console.log(`🔍 Room ${roomKey} found:`, {
        currentStatus: room.currentStatus,
        isActive: room.isActive,
        amountOfPlayers: room.amountOfPlayers,
        admin: room.admin
      });
      
      const isWaiting = room.currentStatus === GAME_ROOM_STATUS.WAITING;
      console.log(`🔍 Room ${roomKey} status check: ${room.currentStatus} === ${GAME_ROOM_STATUS.WAITING} = ${isWaiting}`);
      
      return isWaiting;
    } catch (error) {
      console.error('Error checking room status:', error);
      return false;
    }
  }

  function createWaitingRoomState() {
    return {
      players: new Map(),
      host: null,
    };
  }

  async function getWaitingRoomKey(socket) {
    for (const roomKey of socket.rooms) {
      if (await isWaitingRoom(roomKey)) {
        return roomKey;
      }
    }
    return null;
  }

  function broadcastPlayerList(roomKey) {
    const state = waitingRooms.get(roomKey);
    if (!state) return;

    const playersList = Array.from(state.players.values()).map((player) => ({
      id: player.id,
      name: player.name,
      avatarImg: player.avatarImg,
      isGuest: player.isGuest || false,
    }));

    console.log(`📢 Broadcasting player list for room ${roomKey}:`, playersList);
    io.in(roomKey).emit(WAITING_ROOM_EVENTS.PLAYERS_UPDATED, {
      players: playersList,
      count: playersList.length,
      hostId: state.host?.id || null,
    });
  }

  io.on("connection", (socket) => {
    console.log(`🔌 New socket connection: ${socket.id}`);

    socket.on(WAITING_ROOM_EVENTS.JOIN, async ({ roomKey, user }) => {
      console.log(`👋 User ${user.name} (${user.id}) attempting to join room ${roomKey}`);

      if (!(await isWaitingRoom(roomKey))) {
        console.warn(`❌ Room ${roomKey} is not in waiting status`);
        return;
      }

      const state = waitingRooms.get(roomKey) || createWaitingRoomState();

      if (state.players.size === 0) {
        state.host = { socketId: socket.id, id: user.id, name: user.name };
      }

      state.players.set(user.id, {
        socketId: socket.id,
        id: user.id,
        name: user.name,
        avatarImg: user.avatarImg,
        isGuest: user.isGuest || false,
      });

      waitingRooms.set(roomKey, state);
      socket.join(roomKey);
      broadcastPlayerList(roomKey);
    });

    socket.on(WAITING_ROOM_EVENTS.LEAVE, async ({ roomKey }, ack) => {
      const state = waitingRooms.get(roomKey);
      if (!state) return;

      const isHost = state.host?.socketId === socket.id;
      
      // Remove the leaving player from players map (both host and non-host)
      state.players.forEach((u, userId) => {
        if (u.socketId === socket.id) {
          state.players.delete(userId);
        }
      });

      if (isHost) {
        io.in(roomKey).emit(WAITING_ROOM_EVENTS.HOST_LEFT);

        setTimeout(async () => {
          safelyDeleteRoom(roomKey);
        }, 2000);
      } else {
        broadcastPlayerList(roomKey);
      }
      socket.leave(roomKey);
      if (typeof ack === "function") ack();
    });

    socket.on("disconnecting", async () => {
      console.log(`⚠️ Socket ${socket.id} disconnecting`);

      for (const [roomKey, state] of waitingRooms.entries()) {
        if (!(await isWaitingRoom(roomKey))) {
          continue;
        }

        if (state && state.players) {
          for (const [userId, userData] of state.players.entries()) {
          if (userData.socketId === socket.id) {
            const isHost = state.host?.socketId === socket.id;

            state.players.delete(userId);

            if (isHost) {
              io.in(roomKey).emit(WAITING_ROOM_EVENTS.HOST_LEFT);

              setTimeout(async () => {
                safelyDeleteRoom(roomKey);
              }, 2000);
            } else {
              broadcastPlayerList(roomKey);
            }

            break;
          }
        }
        }
      }
    });

    socket.on(WAITING_ROOM_EVENTS.REMOVE, async ({ roomKey, userId }) => {
      console.log(`🚫 User ${userId} being removed from room ${roomKey}`);

      const state = waitingRooms.get(roomKey);
      if (!state) return;

      if (state.players.has(userId)) {
        const isHost = state.host?.id === userId;
        state.players.delete(userId);

        if (isHost) {
          io.in(roomKey).emit(WAITING_ROOM_EVENTS.HOST_LEFT);

          setTimeout(async () => {
            safelyDeleteRoom(roomKey);
          }, 2000);
        } else if (state.players.size === 0) {
          waitingRooms.delete(roomKey);
          console.log(`🗑️ Room ${roomKey} deleted (empty)`);
        } else {
          broadcastPlayerList(roomKey);
        }
      } else {
        console.log(`⚠️ User ${userId} not found in room ${roomKey} for removal`);
      }
    });

    socket.on("disconnect", () => {
      console.log(`❌ Socket ${socket.id} disconnected`);
    });
  });

  return { waitingRooms };
}
