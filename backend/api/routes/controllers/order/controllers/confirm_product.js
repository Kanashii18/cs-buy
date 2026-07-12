import Stripe from 'stripe';
import { STRIPE_SECRET_KEY } from '../../../../config/env';
const stripe = Stripe(STRIPE_SECRET_KEY);

export default async function confirm_product({ request, reply, db }) {
  const id = request.query.o;
  const userInfo = request.userInfo;

  try {
    const read_payment = `
      SELECT payment_gateway, payment_id, amount, wallet_id
      FROM Payments
      WHERE order_id = (SELECT order_id FROM Orders WHERE order_id = ? AND user_id = ?)
    `;

    const payment = await db(read_payment, [id, userInfo.id]);

    if (payment[0].payment_gateway === 'stripe') {
      const paymentIntent = await stripe.paymentIntents.capture(payment[0].payment_id);
      if (paymentIntent.status === 'succeeded') {
        const update_payment = `
          UPDATE Payments
          SET status = 'completed'
          WHERE order_id = (SELECT order_id FROM Orders WHERE order_id = ? AND user_id = ?)
        `;
        await db(update_payment, [id, userInfo.id]);

        const update_balance = `
          UPDATE Wallets
          SET balance = balance + ?, pending = pending - ?
          WHERE wallet_id = ?;
        `;
        await db(update_balance, [payment[0].amount, payment[0].amount, payment[0].wallet_id]);

        const productQuery = `
          UPDATE Orders
          SET status = 'confirmed'
          WHERE order_id = ? AND user_id = ?
        `;
        await db(productQuery, [id, userInfo.id]);
        return reply.code(200).send({ message: 'OK' });
      }
    }
    return reply.code(500).send({ error: 'unknown error, try again later' });
  } catch (err) {
    console.log(err);
    return reply.code(500).send({ error: 'Error updating order' });
  }
}
