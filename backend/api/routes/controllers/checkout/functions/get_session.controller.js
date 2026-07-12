import { randomUUID } from 'crypto';

export default async function({db, request, reply}) {
     const userInfo = request.userInfo;
     const { product_id } = request.body;

     if (!product_id) {
          return reply.code(400).send({ error: 'Missing product_id in request body' });
     }
     const id_session = randomUUID();
     const query = `
          INSERT INTO Checkout_id (
               id,
               user_id,
               product_id,
               expires_at
          ) VALUES (?, ?, ?, DATE_ADD(NOW(), INTERVAL 2 MINUTE))
     `;

     try {
          await db(query, [id_session, userInfo.id, product_id]);

          await db(
               `
                    DELETE FROM Checkout_id
                         WHERE user_id = ?
                         AND id <> ?
               `,
               [userInfo.id, id_session]
          );

          return reply.send({ session_id: id_session });
     } catch {
          return reply.code(500).send({ error: 'Database error' });
     }
}
