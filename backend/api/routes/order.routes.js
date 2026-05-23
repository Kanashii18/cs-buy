// routes/seller.routes.js
import { purchasedController } from './controllers/order.controller.js';

export default function orderRouter(db) {
     const { get_purchased_by_user, get_specific_product, confirm_product } = purchasedController(db);

     return async function (fastify, options) {
          fastify.get('/list', get_purchased_by_user);
          fastify.get('/product', get_specific_product);
          fastify.put("/confirm-product", confirm_product);
     };
}