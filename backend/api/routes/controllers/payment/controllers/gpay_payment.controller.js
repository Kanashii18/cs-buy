import { stripe as defaultStripe } from './_common.js';

export default async function gpay_payment({dependencies = {}, request, reply}) {
     try {
          const { product } = request.body;

          const paymentStripe = dependencies.stripe ?? defaultStripe;

          const paymentIntent = await paymentStripe.paymentIntents.create({
               amount: product.price * 100,
               currency: 'usd',
               automatic_payment_methods: {
                    enabled: true,
               },
          });

          return reply.send({
               clientSecret: paymentIntent.client_secret,
          });
     } catch (err) {
          return reply.code(500).send({
               error: err.message,
          });
     }
}
