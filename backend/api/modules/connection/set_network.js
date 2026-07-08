import { Server } from 'socket.io';
import { chat_network } from './chat.socket';
import { notification_network } from './notification.socket';

export function Init_conection(server, db){

     const users = {};
     const online = new Map();

     const io = new Server(server);
     io.engine.on("connection_error", (err) => {
          console.log("Socket connection_error", {
               code: err.code,
               message: err.message,
               context: err.context,
          });
     });


     io.on('connection', (socket) => {
          const userId = socket.handshake.auth.userId;
          if (!userId) {
               console.log("Connection without user, desconnecting...");
               return socket.disconnect();
          }else{
               console.log("Connected... ", userId);
          }

          socket.userId = userId;
          users[userId] = socket.id;
          if (!online.has(userId)) online.set(userId, new Set());
          online.get(userId).add(socket.id);

          socket.on("user:isOnline", ({ userId: targetUserId }, ack) => {
               console.log("[SERVER] got user:isOnline", targetUserId, "ack?", typeof ack);
               const isOnline = online.has(targetUserId);
               if (typeof ack === "function") ack({ userId: targetUserId, isOnline });
          });

          chat_network(io, users, socket, db);
          notification_network(io, socket);
          
          // Handle user disconnect
          socket.on("disconnect", () => {
               delete users[socket.userId];
          });
     });
     return io;
}