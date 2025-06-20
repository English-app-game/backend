import { WAITING_ROOM_EVENTS } from "./consts.js";
import { GAME_ROOM_STATUS } from "../models/statuses.js";
import { GameRoomModel } from "../models/GameRoom.js";
import mongoose from "mongoose";

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
        return false;
      }
      
      return room.currentStatus === GAME_ROOM_STATUS.WAITING;
    } catch (error) {
      console.error('❌ Error checking room status:', error);
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

    io.in(roomKey).emit(WAITING_ROOM_EVENTS.PLAYERS_UPDATED, {
      players: playersList,
      count: playersList.length,
      hostId: state.host?.id || null,
    });
  }

  io.on("connection", (socket) => {

    socket.on(WAITING_ROOM_EVENTS.JOIN, async ({ roomKey, user }) => {
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
      console.log(`✅ ${user.name} joined room ${roomKey} (${state.players.size} players)`);
      broadcastPlayerList(roomKey);
    });

    socket.on(WAITING_ROOM_EVENTS.LEAVE, async ({ roomKey }, ack) => {
      const state = waitingRooms.get(roomKey);
      if (!state) {
        if (typeof ack === "function") ack();
        return;
      }

      const isHost = state.host?.socketId === socket.id;
      let removedUserId = null;
      let removedUserName = null;
      
      // Find and remove the leaving player from players map
      state.players.forEach((u, userId) => {
        if (u.socketId === socket.id) {
          removedUserId = userId;
          removedUserName = u.name;
          state.players.delete(userId);
        }
      });

      if (removedUserName) {
        console.log(`🚪 ${removedUserName} left room ${roomKey}`);
      }

      if (isHost) {
        console.log(`👑 Host left room ${roomKey}`);
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
      // Only log if socket was actually in waiting rooms
      const socketRooms = [...socket.rooms].filter(room => room !== socket.id);
      let wasInWaitingRoom = false;

      for (const [roomKey, state] of waitingRooms.entries()) {
        if (!(await isWaitingRoom(roomKey))) {
          continue;
        }

        if (state && state.players) {
          for (const [userId, userData] of state.players.entries()) {
            if (userData.socketId === socket.id) {
              wasInWaitingRoom = true;
              console.log(`🚪 ${userData.name} disconnected from room ${roomKey}`);
              const isHost = state.host?.socketId === socket.id;

              state.players.delete(userId);

              // Also remove from database with retry logic
              const removeFromDB = async (retryCount = 0) => {
                const MAX_RETRIES = 3;
                try {
                  const room = await GameRoomModel.findOne({ key: roomKey });
                  if (!room) {
                    return;
                  }

                  const isObjectId = mongoose.Types.ObjectId.isValid(userId);
                  
                  // Check if user is actually in the room
                  const userExists = isObjectId 
                    ? room.players.some((playerId) => playerId.toString() === userId)
                    : room.guestPlayers.some((g) => g.id === userId);
                  
                  if (!userExists) {
                    return;
                  }

                  // Remove player
                  if (isObjectId) {
                    room.players = room.players.filter((playerId) => playerId.toString() !== userId);
                  } else {
                    room.guestPlayers = room.guestPlayers.filter((g) => g.id !== userId);
                  }
                  room.amountOfPlayers = room.players.length + room.guestPlayers.length;
                  
                  if (room.amountOfPlayers === 0) {
                    // Use findOneAndDelete to avoid race conditions
                    const deletedRoom = await GameRoomModel.findOneAndDelete({ 
                      key: roomKey,
                      _id: room._id 
                    });
                    
                    if (deletedRoom) {
                      console.log(`🗑️ Room ${roomKey} deleted (empty)`);
                    }
                  } else {
                    await room.save();
                  }
                } catch (dbError) {
                  if ((dbError.name === 'VersionError' || dbError.name === 'DocumentNotFoundError') && retryCount < MAX_RETRIES) {
                    await new Promise(resolve => setTimeout(resolve, 100 * (retryCount + 1)));
                    return removeFromDB(retryCount + 1);
                  }
                  console.error("❌ Database update failed during disconnect:", dbError);
                }
              };
              
              await removeFromDB();

              if (isHost) {
                console.log(`👑 Host disconnected from room ${roomKey}`);
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
      const state = waitingRooms.get(roomKey);
      if (!state) return;

      if (state.players.has(userId)) {
        const playerName = state.players.get(userId)?.name;
        const isHost = state.host?.id === userId;
        state.players.delete(userId);

        if (playerName) {
          console.log(`🚫 ${playerName} removed from room ${roomKey}`);
        }

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
      }
    });
  });

  return { waitingRooms };
}
