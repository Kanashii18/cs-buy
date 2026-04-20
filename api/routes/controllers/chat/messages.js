import jwt from 'jsonwebtoken';
import pkg from 'uuid';
const { v4 } = pkg;
import dotenv from 'dotenv';
dotenv.config();

export function messageGestion(db) {
     return {
          // Leer mensajes de la sala de chat
          readRoom: async (request, reply) => {
               const { roomId } = request.body;
               try {
                    // Usamos mysql2 para realizar la consulta
                    const results = await db(`
                         SELECT * FROM Messages
                         WHERE chat_id = ?
                         ORDER BY timestamp ASC
                    `, [roomId]);

                    reply.send(results); // Responder con los mensajes encontrados
               } catch (err) {
                    console.error(err);
                    reply.code(500).send({ error: 'Error leyendo mensajes' });
               }
          },

          // Enviar un nuevo mensaje
          postChat: async (request, reply) => {
               const userInfo = request.userInfo;

               const { roomId, recibe_id, message } = request.body;

               if (!roomId || !message || !recibe_id) {
                    return reply.code(400).send({ error: 'Missing required fields' });
               }

               // Crear el nuevo mensaje
               const newMessage = {
                    message_id: v4(),
                    chat_id: roomId,  // Usamos el chat_id de la sala
                    sender_id: userInfo,
                    message,
                    timestamp: new Date().toISOString().slice(0, 19).replace('T', ' ')
               };

               try {
                    // Insertar el nuevo mensaje en la base de datos usando mysql2
                    await db(`
                         INSERT INTO Messages (message_id, chat_id, sender_id, text, timestamp)
                         VALUES (?, ?, ?, ?, ?)
                    `, [
                         newMessage.message_id,  // El primer parámetro: message_id
                         newMessage.chat_id,     // El segundo parámetro: chat_id
                         newMessage.sender_id,   // El tercer parámetro: sender_id
                         newMessage.message,     // El cuarto parámetro: text
                         newMessage.timestamp    // El quinto parámetro: timestamp
                    ]);

                    // Responder con el nuevo mensaje insertado
                    reply.code(201).send(newMessage);
               } catch (err) {
                    console.error('Error inserting message:', err);
                    reply.code(500).send({ error: 'Error inserting message' });
               }
          },
          get_unread: async (request, reply) => {
               const userInfo = request.userInfo;
               const id = request.query.id;

               const notice = `
                    SELECT COUNT(*) AS unread_count
                    FROM Notifications
                    WHERE user_id = ? AND unread = TRUE
               `
               const count_notice = await db(notice,[userInfo.id]);

               const query = `
                    SELECT user_id, other_id, unread_count_user_1, unread_count_user_2
                    FROM chat_user_room_status
                    WHERE (user_id = ? OR other_id = ?)
               `;

               const response = await db(query, [id, id]);
               
               let totalUnread = 0;
               if (response.length === 0) {
                    return reply.code(200).send({ unread: 0, notice: count_notice[0].unread_count });
               } else {

                    // recopilar todos los unread correspondientes
                    for (let row of response) {
                         if (row.user_id === id) {
                              totalUnread += row.unread_count_user_1;
                         }
                         if (row.other_id === id) {
                              totalUnread += row.unread_count_user_2;
                         }
                    }
                    console.log(totalUnread);
                    return reply.code(200).send({ unread: totalUnread, notice:count_notice[0].unread_count });
               }
          }
     };
}
