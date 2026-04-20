// routes/auth.routes.js
import { WalletController } from "./controllers/wallet.controller.js";

export default function walletRouter(db) {
     const { available_balance, 
          total_balance,
          pending_balance,
          retire_balance,
          checkout } = WalletController(db);

     return async function (fastify, options) {
          fastify.get('/count', total_balance);
          fastify.get('/available_balance', available_balance);
          fastify.get("/pending", pending_balance);
          fastify.post("/withdraw", retire_balance);
          fastify.post('/wallet/checkout', checkout);
     };
}