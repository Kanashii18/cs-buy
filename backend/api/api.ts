import Fastify from 'fastify';
import next from "next";

// Load environment variables
import 'dotenv/config';

// middleware...
import { ensureDevice } from './routes/controllers/user.controller.js';

// modules...
import { Init_conection } from './modules/connection/set_network.js';
import { registers_api } from "./modules/registers/registers.js";
// scripts...
import {db} from "./scripts/db.js";

// indicate mode
// to testing or compile / .env;
const dev = process.env.NODE_ENV !== "production";
const PORT = process.env.PORT || 3000;

// dir: indicamos la ruta de fronted a partir de la raiz,
// ej backend/api/api.ks | frontend/
const app = next({
     dev,
     dir:"./frontend"
});

const handle = app.getRequestHandler();
await app.prepare();

// Initialize Fastify app
const fastify = Fastify({
     logger: {level: "warn"},
     bodyLimit: 4 * 1024 * 1024 // 4mb
});
fastify.addHook('preHandler', ensureDevice);

// ================================================================= //
const io = Init_conection(fastify, db);
registers_api(fastify, io, db); // registers api and routes definition 

// Catch-all route for SPA
fastify.all("/*", async (req, reply) => {
     if (req.raw.url?.startsWith("/api")) return reply.callNotFound();

     await handle(req.raw, reply.raw);
     reply.hijack();
});

// =====================|| Set Server ||===================== //
fastify.listen({ port:PORT, host: "0.0.0.0" });