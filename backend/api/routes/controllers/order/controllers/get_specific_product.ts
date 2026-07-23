import type { Order } from "../../../../types/order/index.type.ts";
import type { OrderDB } from "../../../../types/order/db.type.ts";

export default async function get_specific_product({ request, reply, db } : Order.Params<unknown,Order.Query>) : Promise<void> {
     const userInfo = request.userInfo;
     const id = request.query.o;

     try {
          const order = await db<OrderDB[]>(`
               SELECT
                    have_feedback,
                    product_id,
                    product_image,
                    product_title,
                    seller_id,
                    user_id,
                    status,
                    price_at_purchase,
                    created_at,
                    information,
                    product_type,
                    asset_name
               FROM Orders
               WHERE order_id = ? AND user_id = ?
          `, [id, userInfo.id]);
          if (order.length <= 0) {
               return await reply.code(404).send({ error: 'Order not found' });
          }

          const chatroom = await db(`
               SELECT id
               FROM chat_user_room_status
               WHERE (user_id = ? AND other_id = ?)
               OR (user_id = ? AND other_id = ?)
          `, [
               userInfo.id, order[0].seller_id,
               order[0].seller_id, userInfo.id
          ]);

          const user = await db(`
               SELECT username, img
               FROM Users
               WHERE user_id = ?
          `, [order[0].seller_id]);

          const result = {
               have_feedback: order[0].have_feedback === 1 ? true : false,
               order_id: id,
               room: chatroom[0]?.id || null,
               product_id: order[0].product_id,
               seller_id: order[0].seller_id,
               user_id: order[0].user_id,
               status: order[0].status,
               category: order[0].product_type,
               created_at: order[0].created_at,
               title: order[0].product_title,
               image: order[0].product_image,
               price_at_purchase: order[0].price_at_purchase,
               information: order[0].information,
               name: order[0].asset_name,
               user: {
               username: user[0]?.username,
               img: user[0]?.img
               }
          };

          return await reply.send(result);
     } catch (err) {
          console.error(err);
          return await reply.code(500).send({ error: 'Server Error' });
     }
}
