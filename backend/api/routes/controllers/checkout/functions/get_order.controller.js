export default async function({db, request, reply}) {
     const userInfo = request.userInfo;

     try {
          const orders = await db(
               `
                    SELECT *
                    FROM Orders
                    WHERE user_id = ?
               `,
               [userInfo.user_id]
          );

          return reply.code(200).send(orders);
     } catch (error) {
          console.error('Error getting orders:', error.message);
          return reply.code(500).send({ error: 'Error getting orders' });
     }
}
