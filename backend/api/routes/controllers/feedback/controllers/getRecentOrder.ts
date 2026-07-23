import { GetRecentDB } from "../../../../types/feedback/db.type.ts";
import { Feedback } from "../../../../types/feedback/index.type.ts";

export async function getRecentOrder({ request, reply, db } : Feedback.Params) : Promise<void> {
     const userInfo = request.userInfo;

     try {
          const orders = await db<GetRecentDB[]>(`
               SELECT product_image, product_title, price_at_purchase, created_at
               FROM Orders
               WHERE seller_id = ? AND status = 'confirmed'
               ORDER BY created_at DESC
          `, [userInfo.id]);

          const response = orders.map(order => {
               return {
                    product_image: order.product_image,
                    product_title: order.product_title,
                    price_at_purchase: order.price_at_purchase,
                    time: order.created_at
               };
          });

          return await reply.code(200).send(response);
     } catch (error) {
          console.error('DB error fetching feedbacks:', error);
          return await reply.code(500).send({ error: 'Database error' });
     }
}
