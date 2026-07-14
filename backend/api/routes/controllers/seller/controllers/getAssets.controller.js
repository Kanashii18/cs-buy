
export default async function getAssets({db, reply}) {
     try {
          const query = `
               SELECT 
                    p.product_id,
                    u.user_id,
                    p.title,
                    p.price,
                    p.category,
                    p.quantity,
                    p.image,
                    p.description,
                    u.username AS seller_name,
                    u.rate AS seller_rate 
               FROM Products p
               JOIN Users u ON p.user_id = u.user_id
               WHERE category = 'Assets' AND p.quantity > 0 AND p.deleted = 0; 
          `;

          const products = await db(query);

          return reply.code(200).send(products);

     } catch (error) {
          console.error('Error getting products:', error.message);
          return reply.code(500).send({ error: 'Error getting products' });
     }
}
