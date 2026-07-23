import Stripe from 'stripe';
import { STRIPE_SECRET_KEY } from '../../../../config/env.ts';
import type { Order } from '../../../../types/order/index.type.ts';
import type { PaymentDB } from '../../../../types/order/db.type.ts';
const stripe = new Stripe(STRIPE_SECRET_KEY);

export default async function confirm_product({ request, reply, db } : Order.Params<unknown, Order.Query>) : Promise<void> {
     const id = request.query.o;
     const userInfo = request.userInfo;

     try {
          const [payment] = await db<PaymentDB[]>(`
               SELECT payment_gateway, payment_id, amount, wallet_id
               FROM Payments
               WHERE order_id = (SELECT order_id FROM Orders WHERE order_id = ? AND user_id = ?)
          `, [id, userInfo.id]);

          if (payment.payment_gateway === 'stripe') {
               const paymentIntent = await stripe.paymentIntents.capture(payment.payment_id);
               if (paymentIntent.status === 'succeeded') {
                    await db(`
                         UPDATE Payments
                         SET status = 'completed'
                         WHERE order_id = (SELECT order_id FROM Orders WHERE order_id = ? AND user_id = ?)
                    `, [id, userInfo.id]);
                         
                    await db(`
                         UPDATE Wallets
                         SET balance = balance + ?, pending = pending - ?
                         WHERE wallet_id = ?;
                    `, [payment[0].amount, payment[0].amount, payment[0].wallet_id]);

                    await db(`
                         UPDATE Orders
                         SET status = 'confirmed'
                         WHERE order_id = ? AND user_id = ?
                    `, [id, userInfo.id]);
                    return await reply.code(200).send({ message: 'OK' });
               }
          }
          return await reply.code(500).send({ error: 'unknown error, try again later' });
     } catch (err) {
          console.log(err);
          return await reply.code(500).send({ error: 'Error updating order' });
     }
}
