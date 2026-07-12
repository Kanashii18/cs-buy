import type { Chat_Info } from "../../types/modules/connections/chat.socket.type.ts";
import type { DB } from "../../types/db.type.ts";
import { UUID } from "node:crypto";
import { Server, Socket } from "socket.io";

export function chat_network(io : Server, users:Object, socket:Socket, db:DB, userId : string){
     // Join to chat room
     socket.on('join_room', async (roomId : UUID) => {
          console.log('autenticado...');
          socket.join(roomId);
          console.log(`User ${socket.id} joined room ${roomId}`);

          const userId = socket.data.userId as string;

          const socketsInRoom = io.sockets.adapter.rooms.get(String(roomId))?.size || 0 as Number;
          if (socketsInRoom === 1) {
               await db(`
               UPDATE chat_user_room_status
               SET 
                    unread_count_user_1 = CASE WHEN user_id = ? THEN 0 ELSE unread_count_user_1 END,
                    unread_count_user_2 = CASE WHEN other_id = ? THEN 0 ELSE unread_count_user_2 END
               WHERE id = ?
               `, [userId, userId, roomId]);

          }else if (socketsInRoom === 2) {
               const resetUnreadQuery = `
                    UPDATE chat_user_room_status
                    SET unread_count_user_1 = 0, unread_count_user_2 = 0
                    WHERE id = ?
               `;
               await db(resetUnreadQuery, [roomId]);
          }
     });
     // Chat / sends the message to the room; if the receiver is not there, it increments their unread count and sends them a notification.
     socket.on('send_message', async (data:Chat_Info) => {
          io.to(data.roomId).emit('receive_message', data);

          const socketsInRoom = await io.in(data.roomId).fetchSockets();
          if(socketsInRoom.length === 1){
               const getContextQuery = `
                    SELECT user_id, other_id 
                    FROM chat_user_room_status 
                    WHERE id = ?
               `;
               const resContext = await db(getContextQuery, [data.roomId]);

               if (userId === resContext[0].user_id) {
                    const incrementUnreadQuery = `
                         UPDATE chat_user_room_status
                         SET unread_count_user_2 = unread_count_user_2 + 1
                         WHERE id = ?;
                    `;
                    await db(incrementUnreadQuery, [data.roomId]);
                    const getUnreadCountQuery = `
                         SELECT user_id, other_id
                         FROM chat_user_room_status
                         WHERE id = ?
                    `;
                    const quantity = await db(getUnreadCountQuery, [data.roomId]);
                    const unread_count = {
                         id: data.roomId,
                         unread: 1,
                         receiver: quantity[0].user_id === userId ? quantity[0].other_id : userId,
                         transmitter: quantity[0].other_id === userId ? userId : quantity[0].other_id
                    };
                    console.log(unread_count.receiver, userId);
                    if (unread_count.receiver !== userId) {
                         const receiverSocketId = users[unread_count.receiver]; // Obtenemos el socket ID del receptor
                         
                         if (receiverSocketId) {
                              const receiverSocket = io.sockets.sockets.get(receiverSocketId); // Obtenemos el socket usando su ID
                              if (receiverSocket && receiverSocket.connected) {
                                   receiverSocket.emit('unread_check', unread_count); // Enviamos el mensaje
                              } else {
                                   console.log(`Socket ${unread_count.receiver} no está conectado.`);
                              }
                         } else {
                              console.log(`Usuario ${unread_count.receiver} no encontrado.`);
                         }
                    }
                    // console.log("lo mensaje",unread_count);

               } else if (userId === resContext[0].other_id) {
                    const incrementUnreadQuery = `
                         UPDATE chat_user_room_status
                         SET unread_count_user_1 = unread_count_user_1 + 1
                         WHERE id = ?;
                    `;
                    await db(incrementUnreadQuery, [data.roomId]);
                    
                    const getUnreadCountQuery = `
                         SELECT user_id, other_id, id
                         FROM chat_user_room_status
                         WHERE id = ?
                    `;
                    const quantity = await db(getUnreadCountQuery, [data.roomId]);
                    const unread_count = {
                         id: data.roomId,
                         unread: 1,
                         receiver: quantity[0].user_id,
                         transmitter: quantity[0].other_id
                    };
                    if (unread_count.receiver !== userId) {
                         const receiverSocketId = users[unread_count.receiver]; // Obtenemos el socket ID del receptor

                         if (receiverSocketId) {
                              const receiverSocket = io.sockets.sockets.get(receiverSocketId); // Obtenemos el socket usando su ID
                              if (receiverSocket && receiverSocket.connected) {
                                   receiverSocket.emit('unread_check', unread_count); // Enviamos el mensaje
                              } else {
                                   console.log(`Socket ${unread_count.receiver} no está conectado.`);
                              }
                         } else {
                              console.log(`Usuario ${unread_count.receiver} no encontrado.`);
                         }
                    }
               }
          }
     });
}

