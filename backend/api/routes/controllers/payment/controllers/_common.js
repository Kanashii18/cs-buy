import { randomUUID } from 'crypto';
import finallyOrder from '../payment_success/chat.notify.db.js';
import Order_service from '../payment_success/order.db/service.db.js';
import Order_account from '../payment_success/order.db/account.db.js';
import {
     PAYPAL_CLIENT_ID,
     PAYPAL_SECRET_KEY,
     STRIPE_SECRET_KEY
} from '../../../../config/env';

const Set_orders = {
     account: Order_account,
     service: Order_service,
     final: finallyOrder
};

// Crypto libs
import { ECPairFactory } from 'ecpair';
import * as crypto from 'crypto';
import { payments } from 'bitcoinjs-lib';
import * as tinysecp from 'tiny-secp256k1';

// Stripe
import Stripe from 'stripe';
const stripe = Stripe(STRIPE_SECRET_KEY);

// PayPal
import paypal from 'paypal-rest-sdk';
paypal.configure({
     mode: 'sandbox',
     client_id: PAYPAL_CLIENT_ID,
     client_secret: PAYPAL_SECRET_KEY,
});

export {
     randomUUID,
     Set_orders,
     ECPairFactory,
     crypto,
     payments,
     tinysecp,
     stripe,
     paypal,
};
