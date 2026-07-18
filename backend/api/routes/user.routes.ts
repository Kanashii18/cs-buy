import { userController } from './controllers/user/index.js';
import authMiddleware from '../middleware/verify_session.ts';
import type { FastifyInstance } from 'fastify';
import type { DB } from '../types/db.type.ts';
import type { Filter } from '../types/config_types/filter.type.ts';

export default function userRouter(db:DB, ci:Filter) {
     const user = userController(db, ci);

     return async function (fastify: FastifyInstance) {
          fastify.post('/login', user.loginUser);
          fastify.post('/register', user.createUser);

          fastify.register(async (scope) => {
               scope.addHook('preHandler', authMiddleware);
               scope.delete('/delete', user.deleteUser);
               scope.put('/modify', user.modifyUser);
               scope.get('/notification', user.getNotify);
          });
     };
}