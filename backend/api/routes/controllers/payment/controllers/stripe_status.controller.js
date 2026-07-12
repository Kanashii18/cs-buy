import { randomUUID, Set_orders, stripe as defaultStripe } from './_common.js';

export default async function stripe_status({db, io, users, dependencies = {}, request, reply}) {
     const userInfo = request.userInfo;
     const product = request.product;
     const { paymentIntentId } = request.body;

     if (!paymentIntentId) return reply.code(400).send({ error: 'Payment intent id is required.' });

     try {
          const paymentStripe = dependencies.stripe ?? defaultStripe;
          const paymentIntent_response = await paymentStripe.paymentIntents.retrieve(paymentIntentId);

          if (paymentIntent_response.status !== 'requires_capture') {
               return reply.code(400).send({ error: 'Pago fallido o incompleto.' });
          }

          const security_q = `SELECT payment_processed FROM Payments WHERE payment_id = ?`;
          const response = await db(security_q, [paymentIntent_response.id]);

          if (response.length === 1 && response[0].payment_processed === 1) {
               return reply.code(401).send({ error: 'invalid payment id' });
          }

          let buy_option;
          if (product.category === 'Service') buy_option = dependencies.Orders?.service ?? Set_orders.service;
          else if (product.category === 'Account') buy_option = dependencies.Orders?.account ?? Set_orders.account;
          else return reply.code(400).send('invalid option');

          const update_wallet = `UPDATE Wallets SET pending = pending + ? WHERE user_id = ?;`;
          await db(update_wallet, [product.price, product.user_id]);

          const order_id = randomUUID();

          await buy_option(reply, db, product, userInfo, order_id);

          await (dependencies.Orders?.final ?? Set_orders.final)(reply, db, product, userInfo, io, users);

          const security_u = `
               INSERT INTO Payments (
                    payment_processed, 
                    payment_id, 
                    order_id, 
                    user_id,
                    payment_gateway, 
                    payment_gateway_id, 
                    amount,
                    status,
                    wallet_id
               )
               VALUES (
                    1, ?, ?, ?, ?, ?, ?, ?, 
                    (SELECT wallet_id FROM Wallets WHERE user_id = ?)
               );
          `;

          const gateway_id = randomUUID();

          await db(security_u, [
               paymentIntent_response.id,
               order_id,
               userInfo.id,
               'stripe',
               gateway_id,
               product.price,
               'requires_capture',
               product.user_id,
          ]);

          return reply.code(200).send('OK');
     } catch (error) {
          console.error('Error al verificar el pago:', error);
          return reply.code(500).send({ error: 'Error en el servidor al verificar el pago.' });
     }
}
