import type { ChatParams, ResponseDB } from '../../../../../types/chat/overview.type.ts';

export default async ({ db, request, reply }: ChatParams ) => {
     const userInfo = request.userInfo;

     try {
          // Query to get the chat overview for the user
          const result = await db<ResponseDB[]>(`
               SELECT
                    id,
                    user_id,
                    other_id,
                    listing_id,
                    timestamp,
               CASE
                    WHEN user_id = ? THEN unread_count_user_1
                    WHEN other_id = ? THEN unread_count_user_2
               ELSE 0
               END AS unread_count
               FROM chat_user_room_status
               WHERE user_id = ? OR other_id = ?
          `, [userInfo.id, userInfo.id, userInfo.id, userInfo.id]);
               
          const modifiedResult = result.map(item => {
               if (item.other_id === userInfo.id) {
                    return {
                         ...item,
                         user_id: userInfo.id,
                         other_id: item.user_id,
                    };
               }
               return item; 
          });

          return await reply.send(modifiedResult);
     } catch (err) {
          console.error(err);
          return await reply.code(500).send({ error: 'Server Error' });
     }
}