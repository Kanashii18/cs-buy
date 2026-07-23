import getSession from './controllers/get_session.controller.ts';
import getCheckoutProduct from './controllers/getCheckoutProduct.controller.ts';
import getOrder from './controllers/get_order.controller.ts';
import postOrder from './controllers/post_order.controller.ts';
import type { FastifyReply, FastifyRequest } from 'fastify';
import type { DB } from '../../../types/db.type.ts';
import type { Server } from 'socket.io';
import { product_id, session_id } from '../../../types/checkout/index.type.ts';

/**
 * @returns An object with the checkout controllers.
 */
export default function checkoutController(db : DB, io : Server, users : Object){
     return {
          // Create a new checkout session for a product
          get_session: (request: FastifyRequest<{Body:product_id}>, reply: FastifyReply) => getSession({ db, request, reply }),
          // Get the product details for a given checkout session
          getCheckoutProduct: (request: FastifyRequest<{Querystring:session_id}>, reply: FastifyReply) => getCheckoutProduct({ db, request, reply }),
          // Get the order details for a given user
          get_order: (request: FastifyRequest, reply: FastifyReply) => getOrder({ db, request, reply }),
          // Create a new order for a given user and product
          post_order: (request: FastifyRequest, reply: FastifyReply) => postOrder({ db, io, users, request, reply }),
     };
};