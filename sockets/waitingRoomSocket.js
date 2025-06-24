import { WAITING_ROOM_EVENTS, WAITING_ROOM_TIMEOUTS } from "./consts.js";
import { GAME_ROOM_STATUS } from "../models/statuses.js";
import { GameRoomModel } from "../models/GameRoom.js";
import mongoose from "mongoose";

export function setupWaitingRoomSocketHandlers(io) {
  const waitingRooms = new Map();
  const hostReconnectionTimers = new Map();
  const tempDisconnectionTimers = new Map(); // Track cleanup timers

  async function safelyDeleteRoom(roomKey) {
    // Clear any pending timers for this room
    if (hostReconnectionTimers.has(roomKey)) {
      clearTimeout(hostReconnectionTimers.get(roomKey));
      hostReconnectionTimers.delete(roomKey);
    }

    // Clear temp disconnection timers for this room
    const state = waitingRooms.get(roomKey);
    if (state) {
      for (const userId of state.temporarilyDisconnected.keys()) {
        const timerKey = `${roomKey}:${userId}`;
        if (tempDisconnectionTimers.has(timerKey)) {
          clearTimeout(tempDisconnectionTimers.get(timerKey));
          tempDisconnectionTimers.delete(timerKey);
        }
      }
    }

    io.in(roomKey).emit(WAITING_ROOM_EVENTS.ROOM_CLOSED);
    const sockets = await io.in(roomKey).fetchSockets();
    sockets.forEach((s) => s.leave(roomKey));
    waitingRooms.delete(roomKey);

    try {
      await GameRoomModel.findOneAndDelete({ key: roomKey });
    } catch (err) {
      console.error("DB deletion failed:", err);
    }
  }

  function scheduleRoomDeletion(roomKey, delay, reason = 'timeout', callback = null) {
    if (hostReconnectionTimers.has(roomKey)) {
      clearTimeout(hostReconnectionTimers.get(roomKey));
    }
    
    const timer = setTimeout(async () => {
      hostReconnectionTimers.delete(roomKey);
      await safelyDeleteRoom(roomKey);
      if (callback) callback();
    }, delay);

    hostReconnectionTimers.set(roomKey, timer);
  }

  function cancelRoomDeletion(roomKey) {
    if (hostReconnectionTimers.has(roomKey)) {
      clearTimeout(hostReconnectionTimers.get(roomKey));
      hostReconnectionTimers.delete(roomKey);
      return true;
    }
    return false;
  }

  async function isWaitingRoom(roomKey) {
    try {
      const room = await GameRoomModel.findOne({ key: roomKey });
      return room && room.currentStatus === GAME_ROOM_STATUS.WAITING;
    } catch (error) {
      console.error('Error checking room status:', error);
      return false;
    }
  }

  function createWaitingRoomState() {
    return {
      players: new Map(),
      host: null,
      hostLastSeen: Date.now(),
      temporarilyDisconnected: new Map(),
    };
  }

  function broadcastPlayerList(roomKey) {
    const state = waitingRooms.get(roomKey);
    if (!state) return;

    const activePlayers = Array.from(state.players.values());
    const tempDisconnectedPlayers = Array.from(state.temporarilyDisconnected.values())
      .map(disconnectedInfo => ({
        ...disconnectedInfo.userData,
        socketId: null,
      }));

    const allPlayers = [...activePlayers, ...tempDisconnectedPlayers];

    const playersList = allPlayers.map((player) => ({
      id: player.id,
      name: player.name,
      avatarImg: player.avatarImg,
      isGuest: player.isGuest || false,
      isConnected: !!player.socketId,
    }));

    console.log(`📡 Broadcasting to room ${roomKey}: ${playersList.length} players -`, 
      playersList.map(p => `${p.name}(${p.isConnected ? 'ON' : 'OFF'})`).join(', '));

    io.in(roomKey).emit(WAITING_ROOM_EVENTS.PLAYERS_UPDATED, {
      players: playersList,
      count: playersList.length,
      hostId: state.host?.id || null,
    });
  }

  function scheduleUserCleanup(roomKey, userId) {
    const timerKey = `${roomKey}:${userId}`;
    
    // Clear existing timer if any
    if (tempDisconnectionTimers.has(timerKey)) {
      clearTimeout(tempDisconnectionTimers.get(timerKey));
    }

    const timer = setTimeout(() => {
      const state = waitingRooms.get(roomKey);
      if (state && state.temporarilyDisconnected.has(userId)) {
        state.temporarilyDisconnected.delete(userId);
        broadcastPlayerList(roomKey);
      }
      tempDisconnectionTimers.delete(timerKey);
    }, WAITING_ROOM_TIMEOUTS.TEMP_DISCONNECTION_TIMEOUT);

    tempDisconnectionTimers.set(timerKey, timer);
  }

  io.on("connection", (socket) => {

    socket.on(WAITING_ROOM_EVENTS.JOIN, async ({ roomKey, user }) => {
      console.log(`🚪 JOIN: ${user.name} → room ${roomKey} (socket: ${socket.id})`);
      
      if (!(await isWaitingRoom(roomKey))) {
        console.warn(`❌ Room ${roomKey} is not in waiting status`);
        return;
      }

      const state = waitingRooms.get(roomKey) || createWaitingRoomState();
      const wasHost = state.host?.id === user.id;
      const wasTemporarilyDisconnected = state.temporarilyDisconnected.has(user.id);
      const wasAlreadyInRoom = state.players.has(user.id);

      console.log(`👤 ${user.name}: wasHost=${wasHost}, wasTemp=${wasTemporarilyDisconnected}, wasAlready=${wasAlreadyInRoom}`);

      if (wasHost) {
        cancelRoomDeletion(roomKey);
      }

      if (wasTemporarilyDisconnected) {
        state.temporarilyDisconnected.delete(user.id);
        const timerKey = `${roomKey}:${user.id}`;
        if (tempDisconnectionTimers.has(timerKey)) {
          clearTimeout(tempDisconnectionTimers.get(timerKey));
          tempDisconnectionTimers.delete(timerKey);
        }
      }

      if (state.players.size === 0 || wasHost) {
        state.host = { socketId: socket.id, id: user.id, name: user.name };
        state.hostLastSeen = Date.now();
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
      
      console.log(`✅ ${user.name} joined. Room now has ${state.players.size} players:`, 
        Array.from(state.players.keys()));
      
      broadcastPlayerList(roomKey);
    });

    socket.on(WAITING_ROOM_EVENTS.LEAVE, async ({ roomKey }, ack) => {
      const state = waitingRooms.get(roomKey);
      if (!state) {
        if (typeof ack === "function") ack();
        return;
      }

      const isHost = state.host?.socketId === socket.id;
      
      // Remove player from active players
      for (const [userId, userData] of state.players.entries()) {
        if (userData.socketId === socket.id) {
          state.players.delete(userId);
          break;
        }
      }

      if (isHost) {
        io.in(roomKey).emit(WAITING_ROOM_EVENTS.HOST_LEFT);
        scheduleRoomDeletion(roomKey, WAITING_ROOM_TIMEOUTS.HOST_LEFT_GRACE_PERIOD, 'manual host leave');
      } else {
        broadcastPlayerList(roomKey);
      }
      
      socket.leave(roomKey);
      if (typeof ack === "function") ack();
    });

    socket.on("disconnecting", async () => {
      for (const [roomKey, state] of waitingRooms.entries()) {
        if (!(await isWaitingRoom(roomKey)) || !state?.players) {
          continue;
        }

        for (const [userId, userData] of state.players.entries()) {
          if (userData.socketId === socket.id) {
            const isHost = state.host?.socketId === socket.id;

            // Move to temporarily disconnected
            state.temporarilyDisconnected.set(userId, {
              userData: userData,
              disconnectedAt: Date.now(),
              isHost: isHost
            });

            // Remove from active players
            state.players.delete(userId);

            // Handle database cleanup
            if (!isHost) {
              // For non-hosts, remove from DB and schedule cleanup
              await removeUserFromDB(roomKey, userId);
              scheduleUserCleanup(roomKey, userId);
              broadcastPlayerList(roomKey);
            } else {
              // For hosts, schedule room deletion with grace period
              scheduleRoomDeletion(roomKey, WAITING_ROOM_TIMEOUTS.HOST_RECONNECTION_GRACE_PERIOD, 'host disconnection', () => {
                io.in(roomKey).emit(WAITING_ROOM_EVENTS.HOST_LEFT);
                const roomState = waitingRooms.get(roomKey);
                if (roomState) {
                  roomState.temporarilyDisconnected.clear();
                }
              });
            }
            break;
          }
        }
      }
    });

    socket.on(WAITING_ROOM_EVENTS.REMOVE, async ({ roomKey, userId }) => {
      const state = waitingRooms.get(roomKey);
      if (!state || !state.players.has(userId)) return;

      const isHost = state.host?.id === userId;
      state.players.delete(userId);

      if (isHost) {
        io.in(roomKey).emit(WAITING_ROOM_EVENTS.HOST_LEFT);
        scheduleRoomDeletion(roomKey, WAITING_ROOM_TIMEOUTS.HOST_LEFT_GRACE_PERIOD, 'host removal');
      } else if (state.players.size === 0) {
        await safelyDeleteRoom(roomKey);
      } else {
        broadcastPlayerList(roomKey);
      }
    });
  });

  // Helper function for database cleanup
  async function removeUserFromDB(roomKey, userId, retryCount = 0) {
    const MAX_RETRIES = 3;
    try {
      const room = await GameRoomModel.findOne({ key: roomKey });
      if (!room) return;

      const isObjectId = mongoose.Types.ObjectId.isValid(userId);
      
      // Check if user exists in room
      const userExists = isObjectId 
        ? room.players.some((playerId) => playerId.toString() === userId)
        : room.guestPlayers.some((g) => g.id === userId);
      
      if (!userExists) return;

      // Remove user from appropriate array
      if (isObjectId) {
        room.players = room.players.filter((playerId) => playerId.toString() !== userId);
      } else {
        room.guestPlayers = room.guestPlayers.filter((g) => g.id !== userId);
      }
      
      room.amountOfPlayers = room.players.length + room.guestPlayers.length;
      
      if (room.amountOfPlayers === 0) {
        await GameRoomModel.findOneAndDelete({ key: roomKey, _id: room._id });
      } else {
        await room.save();
      }
    } catch (dbError) {
      if ((dbError.name === 'VersionError' || dbError.name === 'DocumentNotFoundError') && retryCount < MAX_RETRIES) {
        await new Promise(resolve => setTimeout(resolve, 100 * (retryCount + 1)));
        return removeUserFromDB(roomKey, userId, retryCount + 1);
      }
      console.error("Database update failed during disconnect:", dbError);
    }
  }

  return { waitingRooms, hostReconnectionTimers };
}
