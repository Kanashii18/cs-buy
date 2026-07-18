import readRoomController from "./controllers/readRoom.controller.js";
import postChatController from "./controllers/postChat.controller.js";
import getUnreadController from "./controllers/get_unread.controller.js";
import type { DB } from "../../../../types/db.type.ts";
import type { FastifyReply, FastifyRequest } from "fastify";

export default function chat_controller(db : DB){
     return {     
     // Read chat messages in the indicate chat
     readRoom: (request: FastifyRequest, reply: FastifyReply) =>
          readRoomController({ db, request, reply }),
     // Send new message in the indicate chat
     postChat: (request: FastifyRequest, reply: FastifyReply) =>
          postChatController({ db, request, reply }),
     // Get unread messages
     get_unread: (request: FastifyRequest, reply: FastifyReply) =>
          getUnreadController({ db, request, reply })
     };
}