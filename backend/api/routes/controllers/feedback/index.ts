import { getFeedback } from './controllers/getFeedback.ts';
import { getAllFeedback } from './controllers/getAllFeedback.ts';
import { getRecentOrder } from './controllers/getRecentOrder.ts';
import { getTotalSelled } from './controllers/getTotalSelled.ts';
import { postFeedback } from './controllers/postFeedback.ts';
import { getRating } from './controllers/getRating.ts';
import type { FastifyRequest, FastifyReply } from 'fastify';
import type { Body } from '../../../types/fastify.d.ts';
import type { Feedback } from '../../../types/feedback/index.type.ts';

/**
 * This function returns an object containing the feedback controllers.
 * @returns An object with the feedback controllers.
 */
export default function gestionFeedback(db) {
     return {
          // Get feedback for a specific user
          getFeedback: (request: FastifyRequest<{Body:Body.user_id}>, reply: FastifyReply) => getFeedback({ request, reply, db }),
          // Get all feedback in the system
          getAllFeedback: (request: FastifyRequest, reply: FastifyReply) => getAllFeedback({ request, reply, db }),
          // Get the most recent order for a user
          getRecentOrder: (request: FastifyRequest, reply: FastifyReply) => getRecentOrder({ request, reply, db }),
          // Get the total number of products sold by a user
          getTotalSelled: (request: FastifyRequest, reply: FastifyReply) => getTotalSelled({ request, reply, db }),
          // Post feedback for a specific order
          postFeedback: (request: FastifyRequest<{Body:Feedback.Body.PostBody}>, reply: FastifyReply) => postFeedback({ request, reply, db }),
          // Get the average rating for a specific user
          getRating: (request: FastifyRequest, reply: FastifyReply) => getRating({ request, reply, db })
     };
}