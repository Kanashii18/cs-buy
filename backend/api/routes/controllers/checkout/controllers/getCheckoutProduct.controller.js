export default async function({db, request, reply}) {
     const userInfo = request.userInfo;
     const checkout_id = request.query.session_id;

     try {
          const query = `
               SELECT 
                    product_id
               FROM Checkout_id
               WHERE id = ? AND user_id = ? AND expires_at > NOW();
          `;
          const session = await db(query, [checkout_id, userInfo.id]);
          if (session.length === 0) return reply.code(404).send({ error: 'Expired Or Invalid Session' });

          const query_product = `
               SELECT 
                    p.product_id,
                    u.user_id,
                    p.title,
                    p.price,
                    p.category,
                    p.deliveryUnit,
                    p.delivery_value,
                    p.quantity,
                    p.image,
                    u.username AS seller_name
               FROM Products p
               JOIN Users u ON p.user_id = u.user_id
               WHERE p.product_id = ? AND p.quantity > 0 AND p.deleted = 0;
          `;
          const product = await db(query_product, [session[0].product_id]);

          if (product.length === 0) return reply.code(404).send({ error: 'Non-existent Product' });
          return reply.code(200).send(product[0]);
     } catch (error) {
          console.error('Error getting product:', error.message);
          return reply.code(500).send({ error: 'Error getting product' });
     }
}
