import { WAITING_ROOM_EVENTS } from './consts.js';
import { GAME_ROOM_STATUS } from '../models/statuses.js';
import { GameRoomModel } from '../models/GameRoom.js';

export function setupWaitingRoomSocketHandlers(io) {
  const waitingRooms = new Map();

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

    const playersList = Array.from(state.players.values()).map(player => ({
      id: player.id,
      name: player.name,
      avatarImg: player.avatarImg,
      isGuest: player.isGuest || false
    }));

    io.in(roomKey).emit(WAITING_ROOM_EVENTS.PLAYERS_UPDATED, {
      players: playersList,
      count: playersList.length
    });
  }

  io.on("connection", (socket) => {
    
    socket.on(WAITING_ROOM_EVENTS.JOIN, async ({ roomKey, user }) => {
      if (!(await isWaitingRoom(roomKey))) {
        console.warn(`Room ${roomKey} is not in waiting status`);
        return;
      }
      
      const state = waitingRooms.get(roomKey) || createWaitingRoomState();
      
      state.players.set(user.id, {
        socketId: socket.id,
        id: user.id,
        name: user.name,
        avatarImg: user.avatarImg,
        isGuest: user.isGuest || false
      });

      waitingRooms.set(roomKey, state);
      
      socket.join(roomKey);
            
      broadcastPlayerList(roomKey);
    });

    socket.on(WAITING_ROOM_EVENTS.LEAVE, async ({ roomKey, userId }) => {
      if (!(await isWaitingRoom(roomKey))) {
        return;
      }

      const state = waitingRooms.get(roomKey);
      
      if (state && state.players.has(userId)) {
        state.players.delete(userId);
        
        if (state.players.size === 0) {
          waitingRooms.delete(roomKey);
        } else {
          broadcastPlayerList(roomKey);
        }
      }
      
      socket.leave(roomKey);
    });

    socket.on("disconnecting", async () => {
      for (const [roomKey, state] of waitingRooms.entries()) {
        if (!(await isWaitingRoom(roomKey))) {
          continue;
        }

        if (state && state.players) {
          for (const [userId, userData] of state.players.entries()) {
            if (userData.socketId === socket.id) {
              state.players.delete(userId);
              
              if (state.players.size === 0) {
                waitingRooms.delete(roomKey);
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
      if (!(await isWaitingRoom(roomKey))) {
        return;
      }

      const state = waitingRooms.get(roomKey);
      
      if (state && state.players.has(userId)) {
        const userData = state.players.get(userId);
        state.players.delete(userId);
        
        if (state.players.size === 0) {
          waitingRooms.delete(roomKey);
        } else {
          broadcastPlayerList(roomKey);
        }
      }
    });
  });

  return { waitingRooms };
} 