import chatController from './controllers/chat/overview/index.js';
import messageController from './controllers/chat/messages/index.ts';
import type { DB } from '../types/db.type.ts';
import type { FastifyInstance } from 'fastify';

export default function chatRouter(db : DB) {
     const chat = chatController(db);
     const message = messageController(db);

     return async function (fastify : FastifyInstance) {
          fastify.get('/overview', chat.overview);
          fastify.get('/listener', chat.getProduct);
          fastify.put('/markAsRead', chat.markAsRead);
          fastify.post('/messages', message.readRoom);
          fastify.put('/messages', message.postChat);
          fastify.get('/unread', message.get_unread);
     };
}