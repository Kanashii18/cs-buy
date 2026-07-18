import type { Register_Params } from '../../types/modules/registers/registers.type.js';
// Routes
import userRouter from '../../routes/user.routes.ts';
import authRouter from '../../routes/auth.routes.ts';
import chatRouter from '../../routes/chat.routes.ts';
import sellerRouter from '../../routes/seller.routes.ts';
import checkoutRouter from '../../routes/purchase.routes.ts';
import orderRouter from '../../routes/order.routes.ts';
import walletRouter from '../../routes/wallet.routes.ts';
import authMiddleware from "../../middleware/verify_session.js";
import { db } from '../../scripts/db.ts';
import image from "./../../config/filter.ts";

export default async function routes_api({fastify, db, io, users}: Register_Params){
     // ========================== || Routes Definition || ========================== //
     await fastify.register(async (fastify) => {

          fastify.register(userRouter(db, image), { prefix: '/api/user' });
          fastify.register(sellerRouter(db, image), { prefix: '/api/seller' });
          fastify.register(authRouter(db, image), { prefix: '/api/auth' });
          fastify.register( async (scope) => {
               scope.addHook("preHandler", authMiddleware);
               scope.register(chatRouter(db), { prefix: '/api/chat' });
               scope.register(orderRouter(db), { prefix: '/api/order' });
               scope.register(walletRouter(db), { prefix: '/api/account' });

               // checkout scope
               scope.register(checkoutRouter({db, io, users}),
               { prefix: '/api/verify/checkout' });
          })
     });
}