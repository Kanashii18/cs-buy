/**
 * Fetches products added by the authenticated user.
 */
export default async function getProductSelf({db, request, reply}) {
     const userInfo = request.userInfo;

     try {

          const stmt = `
                    SELECT
                         category,
                         product_id,
                         title,
                         price,
                         created_at,
                         active,
                         quantity,
                         image,
                         deleted
                    FROM Products 
                    WHERE user_id = ? AND deleted = 0`;
          const products = await db(stmt, [userInfo.id]);
          return reply.code(200).send(products);

     } catch (error) {
          console.error('Error getting products:', error.message);
          return reply.code(500).send({ error: 'Error getting products' });
     }
}
