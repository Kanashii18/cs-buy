import type { FastifyReply, FastifyRequest } from "fastify";
import type { DB } from "../db.type.ts";

export type product_id = {
     product_id: string;
};
export type session_id = {
     session_id: string;
};

export namespace Checkout {
     export type Params<Body = unknown, Querystring = unknown> = {
          db: DB;
          request: FastifyRequest<{ Body?:Body; Querystring?: Querystring }>;
          reply: FastifyReply;
     };
}