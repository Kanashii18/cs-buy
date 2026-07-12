export default async function ({db, request, reply}) {
     const { product_id } = request.body;
     const userInfo = request.userInfo;
     try {
          const query = `
               UPDATE Products
               SET deleted = 1
               WHERE product_id = ? AND user_id = ? AND deleted = 0;
          `;

          const result = await db(query, [product_id, userInfo.id]);
          if (result.affectedRows > 0) {
          reply.code(200).send("OK");
          } else {
          reply.code(404).send("NOT_FOUND");
          }
     } catch (error) {
          console.error('Error getting products:', error.message);
          reply.code(500).send({ error: 'Error getting products' });
     }
}
