import Fastify from 'fastify';
import cookie from '@fastify/cookie';
import multipart from "@fastify/multipart";
import staticFiles from '@fastify/static';

import path from 'path';
import next from "next";
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Routes

import userRouter from './routes/user.routes.js';
import authRouter from './routes/auth.routes.js';
import chatRouter from './routes/chat.routes.js';
import sellerRouter from './routes/seller.routes.js';
import checkoutRouter from './routes/purchase.routes.js';
import orderRouter from './routes/order.routes.js';
import walletRouter from './routes/wallet.routes.js';

// Load environment variables
import 'dotenv/config';

// middleware...
import {checkoutID_verify, authMiddleware} from "./middleware/verify_session.js";
import { ensureDevice } from './routes/controllers/user.controller.js';

// modules...
import cloudinary from "./modules/filter.js";
import { Init_conection } from './modules/connection/set_network.js';

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

await fastify.register(multipart,{
     limits:{
          fileSize: 10 * 1024 * 1024
     },
});

fastify.register(staticFiles, {
     root: path.join(__dirname),
     prefix: '/robots.txt',
     decorateReply: false
});

// Register plugins
fastify.register(cookie);
fastify.addHook('preHandler', ensureDevice);



// ================================================================= //
const {io, users} = Init_conection();

// ========================== || Routes Definition || ========================== //
fastify.register(async (fastify) => {
     fastify.register(userRouter(db, cloudinary, authMiddleware), { prefix: '/api/user' });
     fastify.register(sellerRouter(db, cloudinary, authMiddleware), { prefix: '/api/seller' });
     fastify.register(authRouter(db, cloudinary, authMiddleware), { prefix: '/api/auth' });

     fastify.register( async (scope) => {
          scope.addHook("preHandler", authMiddleware);
          scope.register(chatRouter(db, io), { prefix: '/api/chat' });
          scope.register(orderRouter(db), { prefix: '/api/order' });
          scope.register(walletRouter(db), { prefix: '/api/account' });

          // checkout scope
          scope.register(checkoutRouter(db, io, users, checkoutID_verify), { prefix: '/api/verify/checkout' });
     })
});

// Catch-all route for SPA
fastify.all("/*", async (req, reply) => {
     if (req.raw.url?.startsWith("/api")) return reply.callNotFound();

     await handle(req.raw, reply.raw);
     reply.hijack();
});

// =====================|| Set Server ||===================== //
fastify.listen({ port:PORT, host: "0.0.0.0" });