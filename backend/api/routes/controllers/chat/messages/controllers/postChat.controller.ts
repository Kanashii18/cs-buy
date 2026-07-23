import {randomUUID} from "node:crypto";
import type { ChatParams, postChatBody } from "../../../../../types/chat/overview.type.ts";
export default async ({db, request, reply} : ChatParams<postChatBody>) : Promise<void> => {
     const userInfo = request.userInfo;
     const { roomId, receive_id, message } = request.body;
     if (!roomId || !message || !receive_id) {
          return await reply.code(400).send({ error: 'Missing required fields' });
     }

     // Create a new message object with the necessary fields
     const newMessage = {
          message_id: randomUUID(),
          chat_id: roomId,  // Use the provided roomId
          sender_id: userInfo,
          message,
          timestamp: new Date().toISOString().slice(0, 19).replace('T', ' ')
     };

     try {
          // Insert the new message into the Messages table
          await db(`
               INSERT INTO Messages (message_id, chat_id, sender_id, text, timestamp)
               VALUES (?, ?, ?, ?, ?)
          `, [
               newMessage.message_id,  // The first parameter: message_id
               newMessage.chat_id,     // The second parameter: chat_id
               newMessage.sender_id,   // The third parameter: sender_id
               newMessage.message,     // The fourth parameter: text
               newMessage.timestamp    // The fifth parameter: timestamp
          ]);

          // Respond with the newly created message
          await reply.code(201).send(newMessage);
     } catch (err) {
          console.error('Error inserting message:', err);
          await reply.code(500).send({ error: 'Error inserting message' });
     }
}