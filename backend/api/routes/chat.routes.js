import chatController from './controllers/chat/overview/index.js';
import messageController from './controllers/chat/messages/index.js';

export default function chatRouter(db) {
     const chat = chatController(db);
     const message = messageController(db);

     return async function (fastify) {
          fastify.get('/overview', chat.overview);
          fastify.get('/listener', chat.getProduct);
          fastify.put('/markAsRead', chat.markAsRead);
          fastify.post('/messages', message.readRoom);
          fastify.put('/messages', message.postChat);
          fastify.get('/unread', message.get_unread);
     };
}