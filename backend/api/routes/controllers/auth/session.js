import check_session from "../../../scripts/check_session.js";

export async function auth_session(db, request, reply) {

     try {
          const r = await check_session(request, reply)
          // if response isn't 200
          if(r.code !== 200) return reply.code(r.code).send({error:r.msg});
          let userInfo = request.userInfo;
          // if the user have not session return 200 and continue...
          console.log(userInfo);
          if(!request.userInfo) return reply.code(200).send({ loggedIn: false });

          const query = `SELECT * FROM Users WHERE user_id = ?`;
          const results = await db(query, [userInfo.id]);

          if (results.length === 0) {
               return reply.send({ loggedIn: false });
          }

          const userData = results[0];

          reply.send({
               loggedIn: true,
               id: userData.user_id,
               username: userData.username,
               role: userData.role,
               img: userData.img,
          });

     } catch (error) {
          console.log("error en el login\n\n\n\n",error);
          reply.send({ loggedIn: false, error: "Server Error" });
     }
}