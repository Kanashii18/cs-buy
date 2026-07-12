import { stripe as defaultStripe } from './_common.js';

export default async function stripe_payment({ dependencies = {}, request, reply }) {
     const product = request.product;
     const userInfo = request.userInfo;
     const { payment_method } = request.body;

     if (!payment_method) return reply.code(400).send({ error: 'Payment method is required.' });

     const priceUSD = Number(product.price);
     if (!Number.isFinite(priceUSD) || priceUSD <= 0) return reply.code(400).send({ error: 'Invalid product price.' });

     const amountInCents = Math.round(priceUSD * 100);

     try {
          const paymentStripe = dependencies.stripe ?? defaultStripe;

          const paymentIntent = await paymentStripe.paymentIntents.create({
               amount: amountInCents,
               currency: 'usd',
               payment_method,
               confirmation_method: 'automatic',
               capture_method: 'manual',
               confirm: true,
               payment_method_types: ['card'],
               payment_method_options: { card: { request_three_d_secure: 'any' } },
               metadata: {
                    product_id: product.product_id,
                    user_id: userInfo.id,
                    seller_id: product.user_id,
               },
          });

          if (paymentIntent.status === 'requires_capture' || paymentIntent.status === 'requires_action') {
               return reply.code(200).send({ id: paymentIntent.client_secret, status: paymentIntent.status, payment_id: paymentIntent.id });
          }

          return reply.code(400).send({ error: 'Pago fallido o incompleto.', status: paymentIntent.status });
     } catch (error) {
          console.error(error);
          return reply.code(500).send({ error });
     }
}
