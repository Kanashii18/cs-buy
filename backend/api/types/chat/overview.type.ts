import type { FastifyReply, FastifyRequest } from "fastify";
import type { DB } from "../db.type.ts";
import type { UUID } from "node:crypto";

export type RoomId = {
     roomId: UUID;
};
export type postChatBody = {
     roomId: RoomId;
     receive_id: UUID;
     message: string;
};

export namespace ChatDB {
     export interface GetUnread {
          user_id: UUID;
          other_id: UUID;
          unread_count_user_1: number;
          unread_count_user_2: number;
     }
}
export type ResponseDB = {
     id: string;
     user_id: string;
     other_id: string;
     listing_id: string;
     timestamp: Date;
     unread_count: number;
};


export type ChatParams<Body=unknown, Querystring=unknown> = {
     db: DB;
     request: FastifyRequest<{Body?:Body, Querystring?:Querystring}>;
     reply: FastifyReply;
}