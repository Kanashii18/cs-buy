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

export default async function routes_api({fastify, io, users}: Register_Params){
     // ========================== || Routes Definition || ========================== //
     await fastify.register(async (fastify) => {

          fastify.register(userRouter(), { prefix: '/api/user' });
          fastify.register(sellerRouter(), { prefix: '/api/seller' });
          fastify.register(authRouter(), { prefix: '/api/auth' });
          fastify.register( async (scope) => {
               scope.addHook("preHandler", authMiddleware);
               scope.register(chatRouter(io), { prefix: '/api/chat' });
               scope.register(orderRouter(), { prefix: '/api/order' });
               scope.register(walletRouter(), { prefix: '/api/account' });

               // checkout scope
               scope.register(checkoutRouter( io, users),
               { prefix: '/api/verify/checkout' });
          })
     });
}