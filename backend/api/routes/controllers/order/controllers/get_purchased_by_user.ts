import type { QueryResult } from "mysql2";
import type { Order } from "../../../../types/order/index.type.ts";

export default async function get_purchased_by_user({ request, reply, db } : Order.Params) : Promise<void> {
     const token : string = request.cookies.session_token;
     if (!typeof(token)) {
          return reply.code(401).send({ error: 'Unauthorized' });
     }

     let userInfo = request.userInfo;
     if(!userInfo) return reply.code(404).send({ error: 'Unauthorized' });

     try {
          const purchasedItems = await db<QueryResult[]>(`
               SELECT order_id, product_id, product_image, product_title, seller_id, status, created_at
               FROM Orders
               WHERE user_id = ?
          `, [userInfo.id]);
          return await reply.code(200).send(purchasedItems);
     } catch (error) {
          console.error('Error fetching purchased items:', error.message);
          return await reply.code(500).send({ error: 'Server error' });
     }
}
