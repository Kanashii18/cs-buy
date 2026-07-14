import { orderController } from './controllers/order/index.js';

export default function orderRouter(db) {
     const order = orderController(db);

     return async function (fastify) {
          fastify.get('/list', order.getPurchasedByUser);
          fastify.get('/product', order.getSpecificProduct);
          fastify.put('/confirm-product', order.confirmProduct);
     };
}