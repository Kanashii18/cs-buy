

import type {FastifyRequest, FastifyReply} from "fastify";
import type { Verify_body } from "../types/middleware/verify_session.type.ts";
import type { User_Scheme } from "../types/user.type.ts";
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
          userInfo = jwt.verify(token, process.env.SECRET_KEY) as User_Scheme;
     }catch{
          return reply.code(401).send({error:"Unauthorized"});
     };
     if(!userInfo.id || !userInfo.img || !userInfo.username) return reply.code(401).send({error:"Miss payload values"});
     // return object { id, img, username } with user info
     request.userInfo = userInfo;
}
