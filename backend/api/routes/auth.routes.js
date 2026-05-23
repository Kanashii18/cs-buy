// routes/auth.routes.js
import { auth_session } from "./controllers/auth/session.js";
import { user_check, profile, seller_check, setting_check, img_check, moderation_check } from "./controllers/auth/checking.js";
import { get_wallet } from "./controllers/auth/wallet.js";
import { logout } from "./controllers/auth/logout.js";

export default function authRouter(db, ci, authMiddleware) {
     return async function (fastify) {
          fastify.get("/user-check", (req, res) => user_check(db, req, res));
          fastify.get('/profile', (req,res) => profile(db, req, res));
          fastify.get("/setting-check", (req, res) => setting_check(db, req, res));
          fastify.get('/session-check', (req, res) => auth_session(db, req, res));
          fastify.post("/seller-check", (req, res) => seller_check(db, req, res));
          fastify.register( async (scope) => {
               scope.addHook("preHandler", authMiddleware);
               scope.post('/validate/image', (req,res) => img_check(db,ci,req,res));
               scope.get('/validate/pass', (req,res) => moderation_check(db,ci,req,res));
               scope.post('/get-wallet', (req, res) => get_wallet(db, req, res));
               scope.post('/logout', (req, res) => logout(req, res));
          })
     };
}