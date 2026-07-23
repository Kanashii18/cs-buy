import type { FastifyReply, FastifyRequest } from "fastify";
import type { DB } from "../../../../../types/db.type.ts";
import type { UserRow } from "../../../../../types/database.type.ts";

export default async function ({db, request, reply} : {db:DB, request: FastifyRequest, reply: FastifyReply}) : Promise<void> {
     const userInfo = request.userInfo;
     try {
          // if the user have not session return 200 and continue...
          if(
               !userInfo||
               !("id" in request.userInfo)||
               !("img" in request.userInfo) ||
               !("username" in request.userInfo) ||
               !("role" in request.userInfo)
          ) return reply.code(200).send({ loggedIn: false });
          
          const query = `SELECT * FROM Users WHERE user_id = ?`;
          const results = await db<UserRow[]>(query, [userInfo.id]);

          if (results.length === 0) {
               return reply.send({ loggedIn: false });
          }

          const userData = results[0];
          return reply.send({
               loggedIn: true,
               id: userData.user_id,
               username: userData.username,
               role: userData.role,
               img: userData.img,
          });

     } catch (error) {
          console.log(error);
          await reply.send({ loggedIn: false, error: "Server Error" });
     }
}