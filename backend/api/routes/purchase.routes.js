// routes/seller.routes.js
import { checkout_Controller } from './controllers/checkout.controller.js';
import { payment_Controller } from './controllers/payment.controller.js';

export default function purchasedRouter(db, io, users,checkoutID_verify) {
     const { get_session, getCheckoutProduct, post_order } = checkout_Controller(db);
     const { crypto_payment, paypal_payment, stripe_payment, stripe_status, gpay_payment } = payment_Controller(db, io, users);

     return async function (fastify) {
          fastify.post('/token', get_session);
          fastify.get('/product', getCheckoutProduct);
          fastify.register( async (checkout) => {
               checkout.addHook("preHandler",checkoutID_verify);
               checkout.post('/order/complete', post_order);
               checkout.post('/crypto_payment/pay', crypto_payment);
               checkout.post('/paypal/pay', paypal_payment);
               checkout.post('/stripe/complete', stripe_payment);
               checkout.post('/stripe/payment-status', stripe_status);
               checkout.post('/create-payment-intent', gpay_payment)
          })
     };
}