export default async function resume({db, request, reply}) {
     const { product_id } = request.body;
     const userInfo = request.userInfo;
     try {
          const query = `
                    UPDATE Products
                    SET active = TRUE
                    WHERE product_id = ? AND user_id = ? AND deleted = 0;
          `;
          const pause = await db(query, [product_id, userInfo.id]);
          if (pause.affectedRows > 0) {
               reply.code(200).send("OK");
          } else {
               reply.code(500).send("BAD");
          }

     } catch (error) {
          console.error('Error getting products:', error.message);
          reply.code(500).send({ error: 'Error getting products' });
     }
}
