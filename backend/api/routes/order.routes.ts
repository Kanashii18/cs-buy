import { orderController } from './controllers/order/index.js';
import type { FastifyInstance } from 'fastify';
import type { DB } from '../types/db.type.ts';

export default function orderRouter(db:DB) {
     const order = orderController(db);

     return async function (fastify : FastifyInstance) {
          fastify.get('/list', order.getPurchasedByUser);
          fastify.get('/product', order.getSpecificProduct);
          fastify.put('/confirm-product', order.confirmProduct);
     };
}