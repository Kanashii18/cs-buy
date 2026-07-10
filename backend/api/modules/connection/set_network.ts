import { Server, type Socket } from 'socket.io';
import { chat_network } from './chat.socket.ts';
import { notification_network } from './notification.socket.ts';
import type { FastifyInstance } from 'fastify';

export function Init_conection(server : FastifyInstance, db){
     if(typeof server !== "object" || !server){
          throw new Error(`Server type invalid value, ${typeof(server)}`);
     }
     const users = {};
     const online = new Map();

     const io = new Server(server.server);
     io.engine.on("connection_error", (err) => {
          console.log("Socket connection_error", {
               code: err.code,
               message: err.message,
               context: err.context,
          });
     });


     io.on('connection', (socket : Socket) => {
          const userId = socket.handshake.auth.userId as string;
          if (!userId) {
               console.log("Connection without user, desconnecting...");
               return socket.disconnect();
          }else{
               console.log("Connected... ", userId);
          }

          socket.data.userId = userId;
          users[userId] = socket.id;
          if (!online.has(userId)) online.set(userId, new Set());
          online.get(userId).add(socket.id);

          socket.on("user:isOnline", ({ userId: targetUserId }, ack) => {
               console.log("[SERVER] got user:isOnline", targetUserId, "ack?", typeof ack);
               const isOnline = online.has(targetUserId);
               if (typeof ack === "function") ack({ userId: targetUserId, isOnline });
          });
          // initialiizate chat socket
          chat_network(io, users, socket, db, userId);
          // initialiizate notifications socket
          notification_network(io, socket, userId);
          
          // Handle user disconnect
          socket.on("disconnect", () => {
               delete users[socket.data.userId];
          });
     });
     return {io, users};
}