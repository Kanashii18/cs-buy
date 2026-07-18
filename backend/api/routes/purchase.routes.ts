// routes/seller.routes.js
import checkoutController from './controllers/checkout/index.js';
import paymentController from './controllers/payment/index.js';
import checkoutID_verify from '../middleware/checkout_verify.ts';

export default function purchaseRouter(db, io, users, dependencies) {

     const checkout = checkoutController(db, io, users);
     const payment = paymentController(db, io, users, dependencies);
     return async function (fastify) {
          fastify.post('/token', checkout.get_session);
          fastify.get('/product', checkout.getCheckoutProduct);
          fastify.register(async (checkoutScope) => {
               checkoutScope.addHook('preHandler', checkoutID_verify);
               checkoutScope.post('/order/complete', checkout.post_order);
               checkoutScope.post('/crypto_payment/pay', payment.crypto_payment);
               checkoutScope.post('/paypal/pay', payment.paypal_payment);
               checkoutScope.post('/stripe/complete', payment.stripe_payment);
               checkoutScope.post('/stripe/payment-status', payment.stripe_status);
               checkoutScope.post('/create-payment-intent', payment.gpay_payment);
          });
     };
}