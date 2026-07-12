/**
 * Fetches a single product by its ID.
 */
export default async function getProductById({db, request, reply}) {
     
     const product_id = request.query.product_id;
     if (!product_id) {
          return reply.code(400).send({ error: 'Missing product_id in query' });
     }

     try {
          const query = `
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
                    p.description,
                    u.username AS seller_name,
                    u.rate AS seller_rate 
               FROM Products p
               JOIN Users u ON p.user_id = u.user_id
               WHERE p.product_id = ? AND p.quantity > 0 AND p.deleted = 0;
          `;
          
          const product = await db(query, [product_id]);

          if (product.length === 0) {
               return reply.code(404).send({ error: 'Product not found' });
          }

          return reply.code(200).send(product[0]);

     } catch (error) {
          console.error('Error getting product:', error.message);
          return reply.code(500).send({ error: 'Error getting product' });
     }
}
