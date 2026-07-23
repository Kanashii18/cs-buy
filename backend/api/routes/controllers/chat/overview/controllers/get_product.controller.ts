import type { ChatParams } from "../../../../../types/chat/overview.type.ts";
import type { ChatQuery, DbChat } from "../../../../../types/chat/get_product.type.ts";

export default async ({ db, request, reply } : ChatParams<unknown, ChatQuery>) : Promise<void> => {
     const { id, actual_user, other_user } = request.query;
     try {

          // extract creation chat date, why search sayns find the table white the "x" actual_user id and "x" other_user id
          // or vice versa "x" other_user id and "x" actual_user id... that'other_user why we send [ actual_user, other_user, OR other_user, actual_user ]
          let created_at = await db(`SELECT created_at FROM chat_user_room_status 
               WHERE (user_id = ? AND other_id = ?)
               OR (user_id = ? AND other_id = ?)`,[
                    actual_user,
                    other_user,
                    other_user,
                    actual_user
               ]);
          created_at = created_at[0].created_at
          
          const query = 'SELECT title, image, product_id FROM Products WHERE product_id = ?';
          const result = await db<DbChat[]>(query, [id]);

          if (result.length === 0) {
               return await reply.code(404).send({ message: 'Producto no encontrado' });
          }

          const { title, image, product_id } = result[0];
          await reply.send({ title, image, product_id, created_at });
     } catch (err) {
          console.log(err);
          return await reply.code(500).send({ message: 'Error al buscar el producto' });
     }
}