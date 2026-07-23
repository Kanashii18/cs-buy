import getPurchased_by_user from './controllers/get_purchased_by_user.ts';
import getSpecific_product from './controllers/get_specific_product.ts';
import confirmProduct from './controllers/confirm_product.ts';
import type { FastifyRequest, FastifyReply } from 'fastify';
import type { DB } from '../../../types/db.type.ts';
import { Order } from '../../../types/order/index.type.ts';

/**
 * This function returns an object containing the order controllers.
 * @returns An object with the order controllers.
 */
export function orderController(db:DB) {
     return {
          // Get the list of purchased products by the user
          getPurchasedByUser: (request: FastifyRequest, reply: FastifyReply) => getPurchased_by_user({ request, reply, db }),
          // Get the details of a specific product in an order
          getSpecificProduct: (request: FastifyRequest<{Querystring: Order.Query}>, reply: FastifyReply) => getSpecific_product({ request, reply, db }),
          // Confirm the receipt of a product in an order
          confirmProduct: (request: FastifyRequest<{Querystring: Order.Query}>, reply: FastifyReply) => confirmProduct({ request, reply, db }),
     };
}