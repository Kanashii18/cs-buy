// routes/auth.routes.js
import { userController } from "./controllers/user.controller.js";

export default function userRouter(db,ci,authMiddleware) {
     const { loginUser,
          createUser,
          deleteUser,
          modifyUser,
          getNotify} = userController(db,ci);

     return async function (fastify) {
          fastify.post('/login', loginUser);
          fastify.post('/register', createUser);
          fastify.register(async(scope)=>{
               scope.addHook("preHandler", authMiddleware);
               scope.delete('/delete', deleteUser);
               scope.put('/modify', modifyUser);
               scope.get('/notification', getNotify);
          })
     };
}