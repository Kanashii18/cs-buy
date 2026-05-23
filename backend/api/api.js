import Fastify from 'fastify';
import cookie from '@fastify/cookie';
import multipart from "@fastify/multipart";
import staticFiles from '@fastify/static';

import check_session from './scripts/check_session.js';

import { Server } from 'socket.io';
import crypto from "crypto"
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

import next from "next";

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ==================== | cloudinary | ==================== //
import cloudinary from 'cloudinary';

cloudinary.v2.config({
     cloud_name: 'dkmcz80mt',
     api_key: process.env.CLOUDINARY_API_KEY,
     api_secret: process.env.CLOUDINARY_API_SECRET
});

// ========================= | DB | ========================= //
import mysql from "./scripts/db.js";
const db = mysql.db;

const dev = process.env.NODE_ENV !== "production";
// dir: indicamos la ruta de fronted a partir de la raiz, ej backend/api/api.ks | frontend/
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
})

const port = process.env.PORT || 3000;

// ===================== // MIDDLEWARES // ===================== //

const authMiddleware = async(request, reply) => {
     const r = await check_session(request, reply)
     // if response isn't 200
     if(r.code!==200) return reply.code(r.code).send({error:r.msg});
}
const checkoutID_verify = async(request, reply) => {
     
     if(!request.query.session_id) return reply.code(400).send({ error: 'Invalid Session' });
     const session_id = request.query.session_id;
     const userInfo = request.userInfo;

     // look for the product_id with the checkout session...
     let query = `
          SELECT
          product_id
          FROM Checkout_id
          WHERE id = ? AND user_id = ?
     `
     let resp_db = await db(query, [session_id, userInfo.id]);

     if(resp_db.length === 0) return reply.code(400).send({error: "Session not found, refrest and try again"});
     const product_id = resp_db[0].product_id;
     // look for the product info
     query = `
          SELECT
               price,
               user_id,
               category,
               title,
               image
          FROM Products
          WHERE product_id = ?
     `
     resp_db = await db(query, [product_id]);
     if(resp_db.length === 0) return reply.code(400).send({error: "Product not found, try later please"});

     return request.product = { 
          price:resp_db[0].price,
          product_id:product_id,
          image:resp_db[0].image,
          title:resp_db[0].title,
          user_id:resp_db[0].user_id,
          category:resp_db[0].category,
     };
};

// ============================================================= //

// // Static files
// fastify.register(staticFiles, {
//      root: path.join(__dirname, 'dist'),
//      prefix: '/'
// });

fastify.register(staticFiles, {
     root: path.join(__dirname),
     prefix: '/robots.txt',
     decorateReply: false
});

// =====================|| Websocket Chat ||===================== //

const users = {};

const io = new Server(fastify.server);
io.engine.on("connection_error", (err) => {
     console.log("Socket connection_error", {
          code: err.code,
          message: err.message,
          context: err.context,
     });
});

const online = new Map();

io.on('connection', (socket) => {
     const userId = socket.handshake.auth.userId;
     if (!userId) {
          console.log("❌ Conexión sin userId. Desconectando.");
          return socket.disconnect();
     }else{
          console.log("conectadooo...", userId);
     }

    
     socket.userId = userId;
     users[userId] = socket.id;
     if (!online.has(userId)) online.set(userId, new Set());
     online.get(userId).add(socket.id);

     socket.on("user:isOnline", ({ userId: targetUserId }, ack) => {
          console.log("[SERVER] got user:isOnline", targetUserId, "ack?", typeof ack);
          const isOnline = online.has(targetUserId);
          if (typeof ack === "function") ack({ userId: targetUserId, isOnline });
     });

     // Join chat room
     socket.on('join_room', async (roomId) => {
          console.log('autenticado...');
          socket.join(roomId);
          console.log(`User ${socket.id} joined room ${roomId}`);

          const userId = socket.userId;

          const socketsInRoom = io.sockets.adapter.rooms.get(String(roomId))?.size || 0;
          if (socketsInRoom === 1) {

               await db(`
               UPDATE chat_user_room_status
               SET 
                    unread_count_user_1 = CASE WHEN user_id = ? THEN 0 ELSE unread_count_user_1 END,
                    unread_count_user_2 = CASE WHEN other_id = ? THEN 0 ELSE unread_count_user_2 END
               WHERE id = ?
               `, [userId, userId, roomId]);

          }else if (socketsInRoom.length === 2) {
               const resetUnreadQuery = `
                    UPDATE chat_user_room_status
                    SET unread_count_user_1 = 0, unread_count_user_2 = 0
                    WHERE id = ?
               `;
               await db(resetUnreadQuery, [roomId]);
          }
     });

     socket.on('send_message', async (data) => {
          io.to(data.roomId).emit('receive_message', data);

          const socketsInRoom = await io.in(data.roomId).fetchSockets();
          if(socketsInRoom.length === 1){
               const getContextQuery = `
                    SELECT user_id, other_id 
                    FROM chat_user_room_status 
                    WHERE id = ?
               `;
               const resContext = await db(getContextQuery, [data.roomId]);

               if (userId === resContext[0].user_id) {
                    console.log("aumentandooo...");
                    const incrementUnreadQuery = `
                         UPDATE chat_user_room_status
                         SET unread_count_user_2 = unread_count_user_2 + 1
                         WHERE id = ?;
                    `;
                    await db(incrementUnreadQuery, [data.roomId]);
                    const getUnreadCountQuery = `
                         SELECT user_id, other_id
                         FROM chat_user_room_status
                         WHERE id = ?
                    `;
                    const quantity = await db(getUnreadCountQuery, [data.roomId]);
                    const unread_count = {
                         id: data.roomId,
                         unread: 1,
                         receiver: quantity[0].user_id === userId ? quantity[0].other_id : userId,
                         transmitter: quantity[0].other_id === userId ? userId : quantity[0].other_id
                    };
                    console.log(unread_count.receiver, userId);
                    if (unread_count.receiver !== userId) {
                         const receiverSocketId = users[unread_count.receiver]; // Obtenemos el socket ID del receptor
                         
                         if (receiverSocketId) {
                              const receiverSocket = io.sockets.sockets.get(receiverSocketId); // Obtenemos el socket usando su ID
                              if (receiverSocket && receiverSocket.connected) {
                                   receiverSocket.emit('unread_check', unread_count); // Enviamos el mensaje
                              } else {
                                   console.log(`Socket ${unread_count.receiver} no está conectado.`);
                              }
                         } else {
                              console.log(`Usuario ${unread_count.receiver} no encontrado.`);
                         }
                    }
                    console.log("lo mensaje",unread_count);

               } else if (userId === resContext[0].other_id) {
                    const incrementUnreadQuery = `
                         UPDATE chat_user_room_status
                         SET unread_count_user_1 = unread_count_user_1 + 1
                         WHERE id = ?;
                    `;
                    await db(incrementUnreadQuery, [data.roomId]);
                    
                    const getUnreadCountQuery = `
                         SELECT user_id, other_id, id
                         FROM chat_user_room_status
                         WHERE id = ?
                    `;
                    const quantity = await db(getUnreadCountQuery, [data.roomId]);
                    const unread_count = {
                         id: data.roomId,
                         unread: 1,
                         receiver: quantity[0].user_id,
                         transmitter: quantity[0].other_id
                    };
                    if (unread_count.receiver !== userId) {
                         const receiverSocketId = users[unread_count.receiver]; // Obtenemos el socket ID del receptor

                         if (receiverSocketId) {
                              const receiverSocket = io.sockets.sockets.get(receiverSocketId); // Obtenemos el socket usando su ID
                              if (receiverSocket && receiverSocket.connected) {
                                   receiverSocket.emit('unread_check', unread_count); // Enviamos el mensaje
                              } else {
                                   console.log(`Socket ${unread_count.receiver} no está conectado.`);
                              }
                         } else {
                              console.log(`Usuario ${unread_count.receiver} no encontrado.`);
                         }
                    }
               }
          }
     });

     socket.on('unread_check', async (unread_count) => {
          if (unread_count.receiver === userId) {
               io.to(socket.id).emit();
          }
     });

     socket.on("notification",(notice)=>{
          if (notice.receiver === userId) {
               io.to(socket.id).emit();
          }
     })

     // Handle user disconnect
     socket.on("disconnect", () => {
          delete users[socket.userId];
     });
});

// ============================================================ //

// Fastify plugins
const sign = v => crypto.createHmac("sha256", process.env.DEVICE_SECRET).update(v).digest("base64url");
const COOKIE = "__did";

async function ensureDevice(request, reply) {
     const c = request.cookies?.[COOKIE];
     if (c) {
          const [id, sig] = c.split(".");
          if (id && sig && sig === sign(id)) { 
               request.deviceId = id; 
               return; 
          }
     }
     const id = crypto.randomUUID();
     reply.setCookie(COOKIE, `${id}.${sign(id)}`, {
          httpOnly: false, 
          sameSite: "lax",
          secure: process.env.NODE_ENV === "production",
          maxAge: 31536000000, 
          path: "/"
     });
     request.deviceId = id;
}

// Register plugins
fastify.register(cookie);
fastify.addHook('preHandler', ensureDevice);

// ========================= || Routes || ========================== //

import userRouter from './routes/user.routes.js';
import authRouter from './routes/auth.routes.js';
import chatRouter from './routes/chat.routes.js';
import sellerRouter from './routes/seller.routes.js';
import checkoutRouter from './routes/purchase.routes.js';
import orderRouter from './routes/order.routes.js';
import walletRouter from './routes/wallet.routes.js';

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
await fastify.listen({ port:4038, host: "0.0.0.0" });