import type { FastifyReply, FastifyRequest } from "fastify";
import type { DB } from "../../../../../types/db.type.ts";
import type { QueryResult } from "mysql2";
import type { IdBody } from "../../../../../types/request.type.ts";

export default async function({ db, request, reply } : {db:DB, request: FastifyRequest<{Body:IdBody}>, reply : FastifyReply}) : Promise<void> {
     const user_id = request.body.id;

     if (!user_id) {
          return await reply.status(400).send({ error: 'user_id is required in request body' });
     }

     try {
          const query = `
               SELECT rate, user_id, username, img
               FROM Users
               WHERE user_id = ?
          `;

          try {
               const results = await db<QueryResult[]>(query, [user_id]);
               if (results.length === 0) {
                    return await reply.status(404).send({ error: 'User not found' });
               }

               return await reply.send(results[0]);
          } catch (err) {
               console.error('Error querying users table:', err);
               return await reply.status(500).send({ error: 'Database query error' });
          }
     } catch (error) {
          console.error(error);
          return await reply.status(500).send({ error: 'Database query error' });
     }
}
