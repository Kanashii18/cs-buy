import gpayPayment from './controllers/gpay_payment.controller.js';
import cryptoPayment from './controllers/crypto_payment.controller.js';
import paypalPayment from './controllers/paypal_payment.controller.js';
import stripePayment from './controllers/stripe_payment.controller.js';
import stripeStatus from './controllers/stripe_status.controller.js';

export default function paymentController(db, io, users, dependencies, request, reply){
     return {
          gpay_payment: gpayPayment({ dependencies, request, reply }),
          crypto_payment: cryptoPayment({ reply }),
          paypal_payment: paypalPayment({ dependencies, request, reply }),
          stripe_payment: stripePayment({ dependencies, request, reply }),
          stripe_status: stripeStatus({ db, io, users, dependencies, request, reply }),
     };
};