import type { FastifyRequest, FastifyReply } from "fastify";
import type { DB } from "../db.type.ts";

export namespace Feedback {
     export interface Params<Body=unknown, Querystring=unknown> {
          request: FastifyRequest<{Body?:Body, Querystring?:Querystring}>;
          reply: FastifyReply;
          db: DB;
     }
     export namespace Body {
          export type PostBody = {
               order_id: string;
               comment: string;
               stars: number;
          }
     }
}

