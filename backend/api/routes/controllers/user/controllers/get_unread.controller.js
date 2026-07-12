export default async ({db, request, reply}) => {
     const id = request.query.id;
     const query = `
          SELECT user_id, other_id, unread_count_user_1, unread_count_user_2
          FROM chat_user_room_status
          WHERE (user_id = ? OR other_id = ?)
     `;

     const response = await db(query, [id, id]);

     if (response.length === 0) {
     return reply.code(200).send({ unread: 0 });
     } else {
     let totalUnread = 0;

     // recopilar todos los unread correspondientes
     for (let row of response) {
          if (row.user_id === id) {
               totalUnread += row.unread_count_user_1;
          }
          if (row.other_id === id) {
               totalUnread += row.unread_count_user_2;
          }
     }
     return reply.code(200).send({ unread: totalUnread });
     }
}