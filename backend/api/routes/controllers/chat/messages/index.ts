import readRoomController from "./controllers/readRoom.controller.ts";
import postChatController from "./controllers/postChat.controller.js";
import getUnreadController from "./controllers/get_unread.controller.ts";
import type { DB } from "../../../../types/db.type.ts";
import type { FastifyReply, FastifyRequest } from "fastify";
import type { RoomId } from "../../../../types/chat/overview.type.ts";
import type { IdQuery } from "../../../../types/request.type.ts";

/**
 * This function returns an object containing the chat controllers.
 * @returns An object with the chat controllers.
 */
export default function chat_controller(db : DB){
     return {     
          // Read chat messages in the indicate chat
          readRoom: (request: FastifyRequest<{Body:RoomId}>, reply: FastifyReply) => readRoomController({ db, request, reply }),
          // Send new message in the indicate chat
          postChat: (request: FastifyRequest, reply: FastifyReply) => postChatController({ db, request, reply }),
          // Get unread messages
          get_unread: (request: FastifyRequest<{Querystring:IdQuery}>, reply: FastifyReply) => getUnreadController({ db, request, reply })
     };
}