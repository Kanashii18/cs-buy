// routes/auth.routes.js
import checkController from "./controllers/auth/checking/index.js";

import logout from "./controllers/auth/logout.ts";

// middleware...
import authMiddleware from "../middleware/verify_session.ts";
import type { DB } from "../types/db.type.ts";
import type { Filter } from "../types/config_types/filter.type.ts";
import type { FastifyInstance } from "fastify";

export default function authRouter(db: DB, ci: Filter) {
     const check = checkController(db, ci);
     return async function (fastify:FastifyInstance) {
          fastify.get("/user-check", check.userCheck);
          fastify.get('/profile', check.profile);
          fastify.get("/setting-check", check.settingCheck);
          fastify.post("/seller-check", check.sellerCheck);
          fastify.get('/session-check', check.sessionCheck);
          fastify.register( async (scope) => {
               scope.addHook("preHandler", authMiddleware); // middleware that authenticate session_id token with jwt
               scope.post('/validate/image', check.imgCheck); // remove, we need to find a solution to this
               scope.get('/validate/pass', check.moderationCheck);
               scope.post('/logout', logout);
          })
     };
}