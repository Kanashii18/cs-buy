import type { ChatParams, RoomId } from "../../../../../types/chat/overview.type.ts";

export default async ({db, request, reply} : ChatParams<RoomId>) => {
     const roomId = request.body.roomId;
     try {
          // Usamos mysql2 para realizar la consulta
          const results = await db(`
               SELECT * FROM Messages
               WHERE chat_id = ?
               ORDER BY timestamp ASC
          `, [roomId]);

          await reply.send(results); // Responder con los mensajes encontrados
     } catch (err) {
          console.error(err);
          await reply.code(500).send({ error: 'Server Error' });
     }
}