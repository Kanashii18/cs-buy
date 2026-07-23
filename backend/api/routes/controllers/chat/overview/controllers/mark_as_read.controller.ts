import { ResultSetHeader } from "mysql2";
import { ChatParams } from "../../../../../types/chat/overview.type.ts";
import { IdBody } from "../../../../../types/request.type.ts";

export default async ({ db, request, reply } : ChatParams<IdBody>) : Promise<void> => {
     
     const user = request.userInfo;
     const senderUserId = request.body.id;

     try {
          // Actualizate chat_room with the corresponding order 
          const info = await db<ResultSetHeader>(`
               UPDATE chat_user_room_status
               SET
               unread_count_user_1 = CASE WHEN user_id = ? THEN 0 ELSE unread_count_user_1 END,
               unread_count_user_2 = CASE WHEN other_id = ? THEN 0 ELSE unread_count_user_2 END
               WHERE (user_id = ? AND other_id = ?)
                    OR (user_id = ? AND other_id = ?)
          `, [user.id, user.id, user.id, senderUserId, senderUserId, user.id]);


          if (info.affectedRows === 0) {
               return await reply.code(404).send({ error: 'No se encontró la conversación' });
          }

          return await reply.send({ success: true });
     } catch (err) {
          console.error(err);
          return await reply.code(500).send({ error: 'Error de base de datos' });
     }
}