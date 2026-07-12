import Fastify from 'fastify';
import '@fastify/cookie';
import next from "next";
// Load environment variables
import 'dotenv/config';

// types
import type {Server} from "socket.io";
import type { FastifyInstance } from 'fastify';

// .env variables
import { PORT, Dev } from './config/env.ts'; 

// middleware...
import { ensureDevice } from './routes/controllers/user/index.js';

// modules...
import { Init_conection } from './modules/connection/set_network.ts';
import registers_api from "./modules/registers/registers.ts";

// scripts...
import {db} from "./scripts/db.ts";

// DEV indicate mode to testing or compile
// dir: indicamos la ruta de fronted a partir de la raiz,
// ej backend/api/api.ks | frontend/
const app = next({
     dev:Dev,
     dir:"../frontend"
});

const handle = app.getRequestHandler();
await app.prepare();

// Initialize Fastify app
const fastify : FastifyInstance = Fastify({
     logger: {level: "warn"},
     bodyLimit: 4 * 1024 * 1024 // 4mb
});
fastify.addHook('preHandler', ensureDevice);

// ========================================================== //
const {io, users} : {io:Server, users} = Init_conection(fastify, db);
registers_api({fastify, db, io, users}); // registers api and routes definition 

// Catch-all route for SPA
fastify.all("/*", async (req, reply) => {
     if (req.raw.url?.startsWith("/api")) return reply.callNotFound();

     await handle(req.raw, reply.raw);
     reply.hijack();
});

// =====================|| Set Server ||===================== //
fastify.listen({ port:PORT, host: "0.0.0.0" });