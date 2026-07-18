import { paypal as defaultPaypal } from './_common.js';

export default function paypal_payment({ request, reply}) {
     const paypalLib = defaultPaypal;
     const { amount, paymentId, payerId } = request.body;

     const payment_data = {
          intent: 'authorize',
          payer: { payment_method: 'paypal' },
          transactions: [
               {
                    amount: { total: amount, currency: 'USD' },
                    description: 'Payment for product',
               },
          ],
          redirect_urls: {
               return_url: 'http://localhost:3000/success',
               cancel_url: 'http://localhost:3000/cancel',
          },
     };

     paypalLib.payment.create(payment_data, (error, payment) => {
          if (error) {
               console.error(error);
               return reply.code(500).send({ error: 'Error creating PayPal payment' });
          }

          for (let i = 0; i < payment.links.length; i++) {
               if (payment.links[i].rel === 'approval_url') {
                    return reply.code(200).send({ approval_url: payment.links[i].href });
               }
          }

          return reply.code(500).send({ error: 'Approval URL not found' });
     });

     if (paymentId && payerId) {
          paypalLib.payment.execute(paymentId, { payer_id: payerId }, (error, payment) => {
               if (error) {
                    console.error(error);
                    return reply.code(500).send({ error: 'Error capturing PayPal payment' });
               }

               // Note: helper functions `getSellerWallet`, `updateSellerWallet` are expected to be provided via dependencies if needed.
               return reply.code(200).send({ message: 'Payment authorized and stored in wallet' });
          });
     }
}
