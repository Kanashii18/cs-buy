// routes/auth.routes.js
import walletController from "./controllers/wallet/index.js";
export default function walletRouter(db) {
     const wallet = walletController(db);
     return async function (fastify) {
          fastify.get('/count', wallet.totalBalance);
          fastify.get('/available_balance', wallet.availableBalance);
          fastify.get('/pending', wallet.pendingBalance);
          fastify.post('/withdraw', wallet.retireBalance);
          fastify.post('/wallet/checkout', wallet.checkout);
          fastify.post('/get-wallet', wallet.getWallet);
          fastify.get('/transactions', wallet.transitions);
     };
}