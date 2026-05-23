import {chatGestion} from "./controllers/chat/overview.js";
import {messageGestion} from "./controllers/chat/messages.js";

export default function chatRouter(db, io){
     const { overview, markAsRead, getProduct } = chatGestion(db);
     const { postChat, readRoom, get_unread } = messageGestion(db);

     return async function (fastify, options) {
          fastify.get('/overview', overview);
          fastify.get('/unread', get_unread);
          fastify.put('/markAsRead', markAsRead);
          fastify.post('/messages', readRoom);
          fastify.put('/messages', postChat);
          fastify.get('/listener', getProduct);
     };
}