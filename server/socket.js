
// server/socket.js
import { Server } from "socket.io";

export const setupSocketIO = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.NODE_ENV === 'production'
        ? process.env.CLIENT_URL || true
        : ["http://localhost:3000", "http://localhost:5173", "http://localhost:5000"],
      methods: ["GET", "POST", "PUT", "DELETE"],
      credentials: true,
      allowedHeaders: ["Content-Type", "Authorization"]
    },
    pingTimeout: 60000,
    pingInterval: 25000,
    transports: ['websocket', 'polling'], // Allow both transports
    allowEIO3: true, // Support for Engine.IO v3 clients
    connectTimeout: 45000,
    maxHttpBufferSize: 1e8 // 100 MB for file transfers
  });

  // Add middleware for authentication (optional)
  io.use((socket, next) => {
    const { userId, username, role } = socket.handshake.query;
    
    // Basic validation - you can enhance this with JWT verification
    if (!userId || !username) {
      return next(new Error("Authentication required"));
    }
    
    // Store user data in socket object
    socket.userData = { userId, username, role };
    next();
  });

  // Store active rooms and users
  const rooms = new Map(); // roomId -> Set of socketIds
  const userSockets = new Map(); // userId -> socketId
  const availableStaff = new Map(); // userId -> staff data
  const chatHistory = new Map(); // roomId -> array of messages
  const directMessageHistory = new Map(); // conversationId -> array of messages
  const messageReactions = new Map(); // messageId -> Map of reactions
  const userRooms = new Map(); // socketId -> roomId (for quick lookup)

  io.on("connection", (socket) => {
    const { userId, username, role } = socket.handshake.query;
    
    if (!userId || !username) {
      console.log("❌ Connection rejected: Missing user data");
      socket.emit("error", { message: "Missing user data" });
      socket.disconnect();
      return;
    }

    console.log(`🔵 User connected: ${username} (${userId}) - Role: ${role} - Socket: ${socket.id}`);
    console.log(`   Connection transport: ${socket.conn.transport.name}`);
    
    // Store user info
    userSockets.set(userId, socket.id);
    socket.userData = { userId, username, role };

    // Send connection confirmation
    socket.emit("connected", { 
      socketId: socket.id,
      userId,
      username,
      role,
      message: "Connected to signaling server",
      timestamp: new Date().toISOString()
    });

    // Consider users as available for consultation (all non-patients)
    const isStaff = !role?.toLowerCase().includes('patient');
    
    if (isStaff) {
      console.log(`🟢 User available for consultation: ${username} (${role})`);
      const staffData = {
        userId,
        username,
        role,
        socketId: socket.id,
        readyAt: new Date().toISOString(),
        status: 'available'
      };
      availableStaff.set(userId, staffData);
      
      // Broadcast to all connected clients
      io.emit("staff-available", staffData);
    }

    // Handle request for message history
    socket.on("request-message-history", (requestingUserId) => {
      console.log(`📜 Sending message history to ${username}`);
      
      try {
        // Send room chat histories (last 100 messages per room)
        const roomHistories = [];
        chatHistory.forEach((messages, roomId) => {
          if (messages && messages.length > 0) {
            roomHistories.push({
              roomId,
              messages: messages.slice(-100) // Last 100 messages
            });
          }
        });
        
        // Send direct message histories (last 100 messages per conversation)
        const dmHistories = [];
        directMessageHistory.forEach((messages, conversationId) => {
          if (conversationId.includes(userId) && messages && messages.length > 0) {
            dmHistories.push({
              conversationId,
              messages: messages.slice(-100)
            });
          }
        });
        
        socket.emit("message-history", {
          roomHistories,
          dmHistories,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        console.error("Error sending message history:", error);
        socket.emit("error", { message: "Failed to load message history" });
      }
    });

    // Handle staff ready status
    socket.on("staff-ready", (staffData) => {
      console.log(`🟢 Staff ready via event: ${staffData.username}`);
      const updatedStaffData = {
        ...staffData,
        socketId: socket.id,
        readyAt: new Date().toISOString(),
        status: 'available'
      };
      availableStaff.set(staffData.userId, updatedStaffData);
      
      io.emit("staff-available", updatedStaffData);
    });

    // Handle request for staff list
    socket.on("request-staff-list", () => {
      const staffList = Array.from(availableStaff.values());
      console.log(`📋 Sending staff list to ${username}: ${staffList.length} staff available`);
      socket.emit("staff-list", staffList);
    });

    // Handle direct messages
    socket.on("direct-message", ({ to, message }) => {
      const targetSocketId = userSockets.get(to);
      
      const fullMessage = {
        ...message,
        id: message.id || `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        sender: {
          userId,
          username,
          role,
          socketId: socket.id
        },
        recipient: {
          userId: to
        },
        timestamp: new Date().toISOString(),
        private: true,
        delivered: false,
        read: false
      };

      // Store in direct message history
      const conversationId = [userId, to].sort().join('-');
      if (!directMessageHistory.has(conversationId)) {
        directMessageHistory.set(conversationId, []);
      }
      const history = directMessageHistory.get(conversationId);
      history.push(fullMessage);
      
      // Keep only last 500 messages
      if (history.length > 500) {
        history.shift();
      }

      if (targetSocketId) {
        console.log(`💬 Direct message from ${username} to ${to} (online)`);
        
        // Send to target user
        io.to(targetSocketId).emit("direct-message", {
          ...fullMessage,
          delivered: true
        });
        
        // Send delivery confirmation to sender
        socket.emit("message-delivered", { 
          messageId: fullMessage.id,
          timestamp: new Date().toISOString()
        });
      } else {
        console.log(`💬 Direct message from ${username} to ${to} (offline - stored)`);
        
        // User is offline - message stored for later delivery
        socket.emit("message-stored", { 
          messageId: fullMessage.id,
          message: "User is offline. Message will be delivered when they connect."
        });
      }
      
      // Send back to sender for confirmation
      socket.emit("direct-message", fullMessage);
    });

    // Handle call initiation
    socket.on("initiate-call", ({ targetUserId, roomId, callType }) => {
      const targetSocketId = userSockets.get(targetUserId);
      if (targetSocketId) {
        console.log(`📞 Initiating ${callType} call to ${targetUserId}`);
        io.to(targetSocketId).emit("call-initiated", {
          from: { userId, username, role, socketId: socket.id },
          roomId,
          callType,
          timestamp: new Date().toISOString()
        });
        
        // Send confirmation to caller
        socket.emit("call-initiating", {
          to: targetUserId,
          roomId,
          callType
        });
      } else {
        socket.emit("call-failed", {
          message: "User is not available",
          targetUserId
        });
      }
    });

    // Handle call rejection
    socket.on("reject-call", ({ from, callType }) => {
      const targetSocketId = userSockets.get(from);
      if (targetSocketId) {
        console.log(`❌ Call rejected by ${username}`);
        io.to(targetSocketId).emit("call-rejected", {
          from: { userId, username, role },
          callType,
          timestamp: new Date().toISOString()
        });
      }
    });

    // Handle call acceptance
    socket.on("accept-call", ({ from, roomId, callType }) => {
      const targetSocketId = userSockets.get(from);
      if (targetSocketId) {
        console.log(`✅ Call accepted by ${username}`);
        io.to(targetSocketId).emit("call-accepted", {
          from: { userId, username, role, socketId: socket.id },
          roomId,
          callType,
          timestamp: new Date().toISOString()
        });
      }
    });

    // Join room
    socket.on("join-room", ({ roomId, callType }) => {
      try {
        const normalizedRoomId = roomId.toLowerCase().trim();
        
        console.log(`👥 ${username} joining room: ${normalizedRoomId} (${callType} call)`);
        
        // Leave previous rooms
        if (userRooms.has(socket.id)) {
          const oldRoom = userRooms.get(socket.id);
          socket.leave(oldRoom);
          console.log(`   Left previous room: ${oldRoom}`);
        }

        // Join new room
        socket.join(normalizedRoomId);
        userRooms.set(socket.id, normalizedRoomId);
        
        // Store room info
        if (!rooms.has(normalizedRoomId)) {
          rooms.set(normalizedRoomId, new Set());
          if (!chatHistory.has(normalizedRoomId)) {
            chatHistory.set(normalizedRoomId, []);
          }
        }
        rooms.get(normalizedRoomId).add(socket.id);

        // Get current participants
        const participants = Array.from(rooms.get(normalizedRoomId) || [])
          .map(id => {
            for (const [uid, sid] of userSockets.entries()) {
              if (sid === id) {
                return { 
                  socketId: id, 
                  userId: uid,
                  username: io.sockets.sockets.get(id)?.userData?.username || 'Unknown',
                  role: io.sockets.sockets.get(id)?.userData?.role || 'unknown'
                };
              }
            }
            return { socketId: id };
          })
          .filter(p => p.userId); // Filter out incomplete participant data

        // Send confirmation with chat history
        socket.emit("room-joined", { 
          roomId: normalizedRoomId,
          participants,
          callType,
          chatHistory: chatHistory.get(normalizedRoomId) || [],
          timestamp: new Date().toISOString()
        });

        // Notify others in the room
        socket.to(normalizedRoomId).emit("user-joined", {
          userId,
          username,
          role,
          socketId: socket.id,
          timestamp: new Date().toISOString()
        });

        console.log(`   Room participants: ${participants.length}`);

      } catch (error) {
        console.error("Error joining room:", error);
        socket.emit("error", { message: "Failed to join room" });
      }
    });

    // WebRTC signaling
    socket.on("offer", ({ to, offer }) => {
      const targetSocketId = userSockets.get(to) || to;
      console.log(`📞 Offer from ${socket.id} to ${targetSocketId}`);
      
      socket.to(targetSocketId).emit("offer", {
        from: socket.id,
        fromUserId: userId,
        fromUsername: username,
        offer,
        timestamp: new Date().toISOString()
      });
    });

    socket.on("answer", ({ to, answer }) => {
      const targetSocketId = userSockets.get(to) || to;
      console.log(`📞 Answer from ${socket.id} to ${targetSocketId}`);
      
      socket.to(targetSocketId).emit("answer", {
        from: socket.id,
        fromUserId: userId,
        fromUsername: username,
        answer,
        timestamp: new Date().toISOString()
      });
    });

    socket.on("ice-candidate", ({ to, candidate }) => {
      const targetSocketId = userSockets.get(to) || to;
      console.log(`❄️ ICE candidate from ${socket.id} to ${targetSocketId}`);
      
      socket.to(targetSocketId).emit("ice-candidate", {
        from: socket.id,
        fromUserId: userId,
        fromUsername: username,
        candidate,
        timestamp: new Date().toISOString()
      });
    });

    // Chat messages
    socket.on("send-message", (message) => {
      console.log(`💬 Message in ${message.roomId} from ${username}: ${message.text?.substring(0, 30)}`);
      
      const fullMessage = {
        ...message,
        id: message.id || `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        sender: {
          userId,
          username,
          role,
          socketId: socket.id
        },
        timestamp: new Date().toISOString(),
        reactions: {},
        delivered: true
      };

      // Store in chat history
      if (message.roomId) {
        if (!chatHistory.has(message.roomId)) {
          chatHistory.set(message.roomId, []);
        }
        const history = chatHistory.get(message.roomId);
        history.push(fullMessage);
        
        // Keep only last 500 messages
        if (history.length > 500) {
          history.shift();
        }
      }

      // Broadcast to room (including sender for confirmation)
      io.to(message.roomId).emit("receive-message", fullMessage);
    });

    // Message reactions
    socket.on("message-reaction", ({ messageId, reaction, userId: reactingUserId }) => {
      console.log(`👍 Reaction ${reaction} on message ${messageId} from ${reactingUserId}`);
      
      if (!messageReactions.has(messageId)) {
        messageReactions.set(messageId, new Map());
      }
      
      const reactions = messageReactions.get(messageId);
      if (!reactions.has(reaction)) {
        reactions.set(reaction, new Set());
      }
      
      const users = reactions.get(reaction);
      if (users.has(reactingUserId)) {
        users.delete(reactingUserId); // Toggle off
      } else {
        users.add(reactingUserId); // Toggle on
      }
      
      // Broadcast reaction update to all clients
      io.emit("message-reaction", {
        messageId,
        reaction,
        userId: reactingUserId,
        timestamp: new Date().toISOString()
      });
    });

    // Delete message
    socket.on("delete-message", ({ messageId, userId: deletingUserId }) => {
      console.log(`🗑️ Deleting message ${messageId} by ${deletingUserId}`);
      
      // Remove from all histories
      let deletedMessage = null;
      
      chatHistory.forEach((messages, roomId) => {
        const index = messages.findIndex(m => m.id === messageId);
        if (index !== -1) {
          if (messages[index].sender?.userId === deletingUserId) {
            deletedMessage = messages[index];
            messages.splice(index, 1);
          }
        }
      });
      
      directMessageHistory.forEach((messages, conversationId) => {
        const index = messages.findIndex(m => m.id === messageId);
        if (index !== -1) {
          if (messages[index].sender?.userId === deletingUserId) {
            deletedMessage = messages[index];
            messages.splice(index, 1);
          }
        }
      });
      
      if (deletedMessage) {
        // Broadcast deletion
        io.emit("message-deleted", { 
          messageId,
          deletedBy: deletingUserId,
          timestamp: new Date().toISOString()
        });
      }
    });

    // Typing indicator
    socket.on("typing", ({ roomId, isTyping }) => {
      socket.to(roomId).emit("user-typing", {
        userId,
        username,
        isTyping,
        timestamp: new Date().toISOString()
      });
    });

    // Request chat history
    socket.on("request-chat-history", (roomId) => {
      if (chatHistory.has(roomId)) {
        socket.emit("chat-history", {
          roomId,
          messages: chatHistory.get(roomId),
          timestamp: new Date().toISOString()
        });
      } else {
        socket.emit("chat-history", {
          roomId,
          messages: [],
          timestamp: new Date().toISOString()
        });
      }
    });

    // Clear chat history
    socket.on("clear-chat", ({ roomId, userId: clearingUserId }) => {
      console.log(`🧹 Clearing chat for ${roomId} by ${clearingUserId}`);
      
      if (roomId) {
        chatHistory.set(roomId, []);
        io.to(roomId).emit("chat-cleared", { 
          roomId, 
          clearedBy: clearingUserId,
          timestamp: new Date().toISOString()
        });
      }
    });

    // Leave room
    socket.on("leave-room", (roomId) => {
      console.log(`👋 ${username} leaving room: ${roomId}`);
      
      socket.leave(roomId);
      userRooms.delete(socket.id);
      
      if (rooms.has(roomId)) {
        rooms.get(roomId).delete(socket.id);
        if (rooms.get(roomId).size === 0) {
          rooms.delete(roomId);
          console.log(`   Room ${roomId} is now empty`);
        }
      }

      socket.to(roomId).emit("user-left", {
        userId,
        username,
        role,
        socketId: socket.id,
        timestamp: new Date().toISOString()
      });
    });

    // Handle disconnection
    socket.on("disconnect", (reason) => {
      console.log(`🔴 User disconnected: ${username} (${userId}) - Reason: ${reason}`);
      
      // Remove from available staff
      if (availableStaff.has(userId)) {
        availableStaff.delete(userId);
        io.emit("staff-unavailable", { 
          userId, 
          reason: "disconnected",
          timestamp: new Date().toISOString()
        });
      }
      
      // Get current room before removal
      const currentRoom = userRooms.get(socket.id);
      
      // Remove from all rooms
      rooms.forEach((sockets, roomId) => {
        if (sockets.has(socket.id)) {
          sockets.delete(socket.id);
          socket.to(roomId).emit("user-left", {
            userId,
            username,
            role,
            socketId: socket.id,
            reason: "disconnected",
            timestamp: new Date().toISOString()
          });
          
          if (sockets.size === 0) {
            rooms.delete(roomId);
            console.log(`   Room ${roomId} removed (empty)`);
          }
        }
      });

      // Remove user from maps
      userSockets.delete(userId);
      userRooms.delete(socket.id);
      
      console.log(`   Active users: ${userSockets.size}, Active rooms: ${rooms.size}`);
    });

    // Handle errors
    socket.on("error", (error) => {
      console.error(`⚠️ Socket error for ${username}:`, error);
    });
  });

  // Add helper methods to io instance (optional)
  io.getActiveUsers = () => Array.from(userSockets.keys());
  io.getActiveRooms = () => Array.from(rooms.keys());
  io.getAvailableStaff = () => Array.from(availableStaff.values());

  return io;
};