import { userController } from './controllers/user/index.js';
import authMiddleware from '../middleware/verify_session.ts';

export default function userRouter(db, ci) {
  const user = userController(db, ci);

  return async function (fastify) {
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