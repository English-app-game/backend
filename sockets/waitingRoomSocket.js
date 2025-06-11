export function setupWaitingRoomSocketHandlers(io) {
  const waitingRooms = new Map();

  function isWaitingRoom(room) {
    return room.startsWith('waiting-') && !io.sockets.sockets.has(room);
  }

  function createWaitingRoomState() {
    return {
      players: new Map(), 
    };
  }

  function getWaitingRoomKey(socket) {
    for (const room of socket.rooms) {
      if (room.startsWith('waiting-')) {
        return room;
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

    io.in(roomKey).emit('waiting-room-players-updated', {
      players: playersList,
      count: playersList.length
    });

  }

  io.on("connection", (socket) => {
    
    socket.on("join-waiting-room", ({ roomKey, user }) => {
      const waitingRoomKey = `waiting-${roomKey}`;
      
      const state = waitingRooms.get(waitingRoomKey) || createWaitingRoomState();
      
      state.players.set(user.id, {
        socketId: socket.id,
        id: user.id,
        name: user.name,
        avatarImg: user.avatarImg,
        isGuest: user.isGuest || false
      });

      waitingRooms.set(waitingRoomKey, state);
      
      socket.join(waitingRoomKey);
            
      broadcastPlayerList(waitingRoomKey);
    });

    socket.on("leave-waiting-room", ({ roomKey, userId }) => {
      const waitingRoomKey = `waiting-${roomKey}`;
      const state = waitingRooms.get(waitingRoomKey);
      
      if (state && state.players.has(userId)) {
        state.players.delete(userId);
        
        if (state.players.size === 0) {
          waitingRooms.delete(waitingRoomKey);
        } else {
          broadcastPlayerList(waitingRoomKey);
        }
      }
      
      socket.leave(waitingRoomKey);
      
    });

    socket.on("disconnecting", () => {
      
      for (const [waitingRoomKey, state] of waitingRooms.entries()) {
        if (state && state.players) {
          for (const [userId, userData] of state.players.entries()) {
            if (userData.socketId === socket.id) {
              state.players.delete(userId);
              
              if (state.players.size === 0) {
                waitingRooms.delete(waitingRoomKey);
              } else {
                broadcastPlayerList(waitingRoomKey);
              }
              break;
            }
          }
        }
      }
    });

    socket.on("remove-from-waiting-room", ({ roomKey, userId }) => {
      const waitingRoomKey = `waiting-${roomKey}`;
      const state = waitingRooms.get(waitingRoomKey);
      
      if (state && state.players.has(userId)) {
        const userData = state.players.get(userId);
        state.players.delete(userId);
        
        
        if (state.players.size === 0) {
          waitingRooms.delete(waitingRoomKey);
        } else {
          broadcastPlayerList(waitingRoomKey);
        }
      }
    });
  });

  return { waitingRooms };
} 