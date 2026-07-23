import { FastifyReply, FastifyRequest } from "fastify"
import { DB } from "../db.type.ts"



export namespace Order{
     export type Params<Body=unknown, Querystring=unknown> = {
          db:DB,
          request:FastifyRequest<{ Body?:Body, Querystring?:Querystring  }>,
          reply:FastifyReply
     }
     export type Query={
          o:string
     }
}