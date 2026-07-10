import { Server } from "socket.io"
import { DB } from "../../db.type.js"
import { FastifyInstance } from "fastify"
import { User_Scheme } from "../../user.type.js"
Server

export interface Register_Params {
     fastify: FastifyInstance 
     db: DB
     io: Server 
     users: User_Scheme
}