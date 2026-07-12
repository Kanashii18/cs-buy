

import type {FastifyRequest, FastifyReply} from "fastify";
import type { Verify_body } from "../types/middleware/verify_session.type.ts";
import type { JWT_Scheme, User_Scheme } from "../types/user.type.ts";
import jwt from 'jsonwebtoken';

/**
 * @returns user information, EJ: { id:UUID, img:string, username:string }
 */
export default function(request:FastifyRequest&Verify_body,reply:FastifyReply) {
     // verify token validation from user...
     const token : string = request.cookies.session_token; // jwt expected
     if(!token || typeof(token) !== "string" ) return {code:401, msg:"Unauthorized"};

     // create userinfo with { id, img, username }
     let userInfo : User_Scheme;
     try {
          userInfo = jwt.verify(token, process.env.SECRET_KEY) as JWT_Scheme;
     }catch{
          userInfo = {loggedIn: false};
          return reply.code(401).send({error:"Unauthorized"});
     };
     if(userInfo)
     if(!userInfo.id || !userInfo.img || !userInfo.username || !userInfo.role) return reply.code(401).send({error:"Miss payload values"});
     // return object { id, img, username, role } with user info

     request.userInfo = userInfo;
}
