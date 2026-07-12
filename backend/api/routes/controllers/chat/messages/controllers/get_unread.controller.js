export default async ({db, request, reply}) => {
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
