import jwt from 'jsonwebtoken';

export function chatGestion(db) {
     return {
          // Ver overview de los chats
          overview: async (request, reply) => {
               const userInfo = request.userInfo;

               try {
                    // Usamos mysql2 para la consulta
                    const result = await db(`
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
                         
                    console.log(result);

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

                    return reply.send(modifiedResult);
               } catch (err) {
                    console.error(err);
                    return reply.code(500).send({ error: 'DB error' });
               }
          },

          // Marcar un mensaje como leído
          markAsRead: async (request, reply) => {

               const user = request.userInfo;
               const senderUserId = request.body.id;

               try {
                    // Usamos mysql2 para la actualización
                    const info = await db(`
                         UPDATE chat_user_room_status
                         SET
                         unread_count_user_1 = CASE WHEN user_id = ? THEN 0 ELSE unread_count_user_1 END,
                         unread_count_user_2 = CASE WHEN other_id = ? THEN 0 ELSE unread_count_user_2 END
                         WHERE (user_id = ? AND other_id = ?)
                              OR (user_id = ? AND other_id = ?)
                    `, [user.id, user.id, user.id, senderUserId, senderUserId, user.id]);


                    if (info.affectedRows === 0) {
                         return reply.code(404).send({ error: 'No se encontró la conversación' });
                    }

                    return reply.send({ success: true });
               } catch (err) {
                    console.error(err);
                    return reply.code(500).send({ error: 'Error de base de datos' });
               }
          },

          getProduct: async (request, reply) => {
               const { id, u, s } = request.query;
               try {

                    // extract creation chat date, why search sayns find the table white the "x" u id and "x" s id
                    // or vice versa "x" s id and "x" u id... that's why we send [ u, s, OR s, u ]
                    let created_at = await db(`SELECT created_at FROM chat_user_room_status 
                                                  WHERE (user_id = ? AND other_id = ?)
                                                  OR (user_id = ? AND other_id = ?)`,[u, s, s, u]);
                    created_at = created_at[0].created_at
                    
                    const query = 'SELECT title, image, product_id FROM Products WHERE product_id = ?';
                    const result = await db(query, [id]);

                    if (result.length === 0) {
                         return reply.code(404).send({ message: 'Producto no encontrado' });
                    }

                    const { title, image, product_id } = result[0];
                    reply.send({ title, image, product_id, created_at });
               } catch (err) {
                    console.log(err);
                    return reply.code(500).send({ message: 'Error al buscar el producto' });
               }
          }
     };
}
