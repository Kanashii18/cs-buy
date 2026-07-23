import { randomUUID } from "node:crypto";
import type { Checkout, product_id } from '../../../../types/checkout/index.type.ts';
import type { ResultSetHeader } from "mysql2";

export default async function({db, request, reply} : Checkout.Params<product_id> ) : Promise<void> {
     const userInfo = request.userInfo;
     const { product_id } = request.body;

     if (!product_id) {
          return await reply.code(400).send({ error: 'Missing product_id in request body' });
     }
     const id_session = randomUUID();
     try {
          let res = await db<ResultSetHeader>(`
               INSERT INTO Checkout_id (
                    id,
                    user_id,
                    product_id,
                    expires_at
               ) VALUES (?, ?, ?, DATE_ADD(NOW(), INTERVAL 2 MINUTE))
          `, [id_session, userInfo.id, product_id]);
          if(res.affectedRows === 0) {
               return reply.code(500).send({ error: 'Failed to create session' });
          }
          res = await db<ResultSetHeader>(
               `
                    DELETE FROM Checkout_id
                         WHERE user_id = ?
                         AND id <> ?
               `,
               [userInfo.id, id_session]
          );
          if(res.affectedRows === 0) {
               return await reply.code(500).send({ error: 'Failed to clean up old sessions' });
          }

          return await reply.send({ session_id: id_session });
     } catch {
          return await reply.code(500).send({ error: 'Database error' });
     }
}
