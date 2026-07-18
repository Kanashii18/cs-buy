import { Server } from "socket.io"
import { DB } from "../../db.type.js"
import { FastifyInstance } from "fastify"

export interface Register_Params {
     fastify: FastifyInstance 
     db: DB
     io: Server 
     users: Object
}