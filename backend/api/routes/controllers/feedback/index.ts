import { getFeedback } from './controllers/getFeedback.ts';
import { getAllFeedback } from './controllers/getAllFeedback.ts';
import { getRecentOrder } from './controllers/getRecentOrder.ts';
import { getTotalSelled } from './controllers/getTotalSelled.ts';
import { postFeedback } from './controllers/postFeedback.ts';
import { getRating } from './controllers/getRating.ts';
import type { FastifyRequest, FastifyReply } from 'fastify';
import type { Body } from '../../../types/fastify.d.ts';
import type { Feedback } from '../../../types/feedback/index.type.ts';

// ================== Feedback Controller ================== //

export default function gestionFeedback(db) {
     return {
          getFeedback: (request: FastifyRequest<{Body:Body.user_id}>, reply: FastifyReply) => getFeedback({ request, reply, db }),
          getAllFeedback: (request: FastifyRequest, reply: FastifyReply) => getAllFeedback({ request, reply, db }),
          getRecentOrder: (request: FastifyRequest, reply: FastifyReply) => getRecentOrder({ request, reply, db }),
          getTotalSelled: (request: FastifyRequest, reply: FastifyReply) => getTotalSelled({ request, reply, db }),
          postFeedback: (request: FastifyRequest<{Body:Feedback.Body.PostBody}>, reply: FastifyReply) => postFeedback({ request, reply, db }),
          getRating: (request: FastifyRequest, reply: FastifyReply) => getRating({ request, reply, db })
     };
}