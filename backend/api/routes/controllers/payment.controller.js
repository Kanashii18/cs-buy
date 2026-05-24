import { randomUUID } from 'crypto';
import dotenv from 'dotenv';
import finallyOrder from './payment_success/chat.notify.db.js';
import Order_service from './payment_success/order.db/service.db.js';
import Order_account from './payment_success/order.db/account.db.js';
dotenv.config();

const Set_orders = {
     account: Order_account,
     service: Order_service,
     final: finallyOrder
};

// ============== // Crypto Configuration // ============== //
import { ECPairFactory } from 'ecpair';
import * as crypto from 'crypto';
import { payments } from 'bitcoinjs-lib';
import * as tinysecp from 'tiny-secp256k1';

// ============== // Stripe Configuration // ============== // 
import Stripe from 'stripe';
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
// ======================================================== // 

// ============== // Configuración de PayPal // ============= //
import paypal from 'paypal-rest-sdk';
paypal.configure({
     mode: 'sandbox',
     client_id: process.env.PAYPAL_CLIENT_ID,
     client_secret: process.env.PAYPAL_SECRET_KEY,
});
// ========================================================== //

export function payment_Controller(db, io, users, dependencies = {}) {
     const paymentStripe = dependencies.stripe ?? stripe;
     const Orders = dependencies.Set_orders ?? Set_orders;

     return {
          // ============= || GPAY || ============ //
          gpay_payment: async (request, reply) => {
               try {
                    const { product } = request.body;

                    const paymentIntent = await paymentStripe.paymentIntents.create({
                         amount: product.price * 100,
                         currency: "usd",
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
          },

          // ============= || Crypto Payment || ============ //
          crypto_payment: async (request, reply) => {
               const litecoin_network = {
                    messagePrefix: '\x19Litecoin Signed Message:\n',
                    bech32: 'ltc',
                    bip32: {
                         public: 0x019da462,
                         private: 0x019d9cfe,
                    },
                    pubKeyHash: 0x30,
                    scriptHash: 0x32,
                    wif: 0xB0,
               };

               const ECPair = ECPairFactory(tinysecp);

               const keyPair = ECPair.makeRandom({
                    rng: crypto.randomBytes,
                    network: litecoin_network,
               });

               const publicKeyCompressed = Buffer.from(keyPair.publicKey);

               const { address: ltcAddress } = payments.p2pkh({
                    pubkey: publicKeyCompressed,
                    network: litecoin_network,
               });

               console.log('Dirección Litecoin (Mainnet):', ltcAddress);

               return reply.code(200).send("OK");
          },

          // ============= || PayPal Payment || ============ //
          paypal_payment: (request, reply) => {
               const { amount, paymentId, payerId } = request.body;

               const payment_data = {
                    intent: 'authorize',
                    payer: {
                         payment_method: 'paypal',
                    },
                    transactions: [
                         {
                              amount: {
                                   total: amount,
                                   currency: 'USD',
                              },
                              description: 'Payment for product',
                         },
                    ],
                    redirect_urls: {
                         return_url: 'http://localhost:3000/success',
                         cancel_url: 'http://localhost:3000/cancel',
                    },
               };

               paypal.payment.create(payment_data, (error, payment) => {
                    if (error) {
                         console.error(error);

                         return reply.code(500).send({
                              error: 'Error creating PayPal payment',
                         });
                    }

                    for (let i = 0; i < payment.links.length; i++) {
                         if (payment.links[i].rel === 'approval_url') {
                              return reply.code(200).send({
                                   approval_url: payment.links[i].href,
                              });
                         }
                    }

                    return reply.code(500).send({
                         error: 'Approval URL not found',
                    });
               });

               if (paymentId && payerId) {
                    paypal.payment.execute(
                         paymentId,
                         { payer_id: payerId },
                         (error, payment) => {
                              if (error) {
                                   console.error(error);

                                   return reply.code(500).send({
                                        error: 'Error capturing PayPal payment',
                                   });
                              }

                              const sellerWallet = getSellerWallet(payment);

                              updateSellerWallet(
                                   sellerWallet,
                                   payment.transactions[0].amount.total,
                              );

                              console.log(
                                   'Payment authorized successfully',
                                   payment,
                              );

                              return reply.code(200).send({
                                   message: 'Payment authorized and stored in wallet',
                              });
                         },
                    );
               }
          },

          // ============= || Stripe Payment || ============ //
          stripe_payment: async (request, reply) => {
               const product = request.product;
               const userInfo = request.userInfo;

               const { payment_method } = request.body;

               if (!payment_method) {
                    return reply.code(400).send({
                         error: 'Payment method is required.',
                    });
               }

               const priceUSD = Number(product.price);

               if (!Number.isFinite(priceUSD) || priceUSD <= 0) {
                    return reply.code(400).send({
                         error: 'Invalid product price.',
                    });
               }

               const amountInCents = Math.round(priceUSD * 100);

               try {
                    const paymentIntent = await paymentStripe.paymentIntents.create({
                         amount: amountInCents,
                         currency: 'usd',
                         payment_method,
                         confirmation_method: "automatic",
                         capture_method: 'manual',
                         confirm: true,
                         payment_method_types: ['card'],
                         payment_method_options: {
                              card: {
                                   request_three_d_secure: 'any',
                              },
                         },
                         metadata: {
                              product_id: product.product_id,
                              user_id: userInfo.id,
                              seller_id: product.user_id,
                         },
                    });

                    if (
                         paymentIntent.status === "requires_capture" ||
                         paymentIntent.status === "requires_action"
                    ) {
                         return reply.code(200).send({
                              id: paymentIntent.client_secret,
                              status: paymentIntent.status,
                              payment_id: paymentIntent.id,
                         });
                    }

                    return reply.code(400).send({
                         error: 'Pago fallido o incompleto.',
                         status: paymentIntent.status,
                    });
               } catch (error) {
                    console.error(error);

                    return reply.code(500).send({
                         error,
                    });
               }
          },

          // ============= || Stripe Status || ============ //
          stripe_status: async (request, reply) => {
               const userInfo = request.userInfo;
               const product = request.product;

               const { paymentIntentId } = request.body;

               if (!paymentIntentId) {
                    return reply.code(400).send({
                         error: 'Payment intent id is required.',
                    });
               }

               try {
                    const paymentIntent_response =
                         await paymentStripe.paymentIntents.retrieve(paymentIntentId);

                    if (paymentIntent_response.status !== 'requires_capture') {
                         return reply.code(400).send({
                              error: 'Pago fallido o incompleto.',
                         });
                    }

                    const security_q = `
                         SELECT payment_processed FROM Payments
                         WHERE payment_id = ?
                    `;

                    const response = await db(security_q, [
                         paymentIntent_response.id,
                    ]);

                    if (
                         response.length === 1 &&
                         response[0].payment_processed === 1
                    ) {
                         return reply.code(401).send({
                              error: "invalid payment id",
                         });
                    }

                    

                    let buy_option;

                    if (product.category === 'Service') {
                         buy_option = Orders.service;
                    } else if (product.category === "Account") {
                         buy_option = Orders.account;
                    } else {
                         return reply.code(400).send("invalid option");
                    }

                    const update_wallet = `
                         UPDATE Wallets
                         SET pending = pending + ?
                         WHERE user_id = ?;
                    `;

                    await db(update_wallet, [product.price, product.user_id]);

                    const order_id = randomUUID();

                    await buy_option(
                         reply,
                         db,
                         product,
                         userInfo,
                         order_id,
                    );

                    await Orders.final(
                         reply,
                         db,
                         product,
                         userInfo,
                         io,
                         users,
                    );

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
                         "stripe",
                         gateway_id,
                         product.price,
                         "requires_capture",
                         product.user_id,
                    ]);

                    return reply.code(200).send("OK");
               } catch (error) {
                    console.error('Error al verificar el pago:', error);

                    return reply.code(500).send({
                         error: 'Error en el servidor al verificar el pago.',
                    });
               }
          },
     };
}