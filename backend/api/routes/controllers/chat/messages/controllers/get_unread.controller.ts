import type { IdQuery } from "../../../../../types/request.type.ts";
import type { ChatDB, ChatParams } from "../../../../../types/chat/overview.type.ts";

export default async ({db, request, reply} : ChatParams<unknown,IdQuery>) => {
     try{
          const userInfo = request.userInfo;
          const id = request.query.id;
          const count_notice = await db(`
               SELECT COUNT(*) AS unread_count
               FROM Notifications
               WHERE user_id = ? AND unread = TRUE
          `,[userInfo.id]);

          const response = await db<ChatDB.GetUnread[]>(`
               SELECT user_id, other_id, unread_count_user_1, unread_count_user_2
               FROM chat_user_room_status
               WHERE (user_id = ? OR other_id = ?)
          `, [id, id]);

          let totalUnread = 0;
          if (response.length === 0) {
               return reply.code(200).send({ unread: 0, notice: count_notice[0].unread_count });
          } else {
               // Calculate the total unread messages for the user
               for (let row of response) {
                    if (row.user_id === id) {
                         totalUnread += row.unread_count_user_1;
                    }
                    if (row.other_id === id) {
                         totalUnread += row.unread_count_user_2;
                    }
               }
               return await reply.code(200).send({ unread: totalUnread, notice:count_notice[0].unread_count });
          }
     }catch(err){
          console.error(err);
          return await reply.code(500).send({ error: 'Server error' });
     }
}
