import {randomUUID} from "node:crypto";
export default async ({db, request, reply}) => {
     const userInfo = request.userInfo;

     const { roomId, recibe_id, message } = request.body;

     if (!roomId || !message || !recibe_id) {
          return reply.code(400).send({ error: 'Missing required fields' });
     }

     // Crear el nuevo mensaje
     const newMessage = {
          message_id: randomUUID(),
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
}