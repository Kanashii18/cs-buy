import { ChatQuery } from "../../../../types/chat/get_product.type.ts";
import { ChatParams } from "../../../../types/chat/overview.type.ts";
import { DB } from "../../../../types/db.type.ts";
import { IdBody } from "../../../../types/request.type.ts";
import getProductController from "./controllers/get_product.controller.ts";
import markAsReadController from "./controllers/mark_as_read.controller.ts";
import overviewController from "./controllers/overview.controller.ts";
import type { FastifyReply, FastifyRequest } from 'fastify';

/**
 * This function returns an object containing the chat overview controllers.
 * @returns An object with the chat overview controllers.
 */
export default function overviewsController(db : DB) {
     return {
          // Ver overview de los chats
          overview: (request : FastifyRequest<{Body:unknown, Querystring:unknown}>, reply : FastifyReply) => overviewController({ request, reply, db }),
          // Marcar un mensaje como leído
          markAsRead: (request : FastifyRequest<{Body:IdBody, Querystring:unknown}>, reply : FastifyReply) => markAsReadController({ request, reply, db }),
          // Get specific product information
          getProduct: (request : FastifyRequest<{Body:IdBody, Querystring:ChatQuery}>, reply : FastifyReply) => getProductController({ request, reply, db })
     };
};