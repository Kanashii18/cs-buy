import type { FastifyReply, FastifyRequest } from "fastify";
import type { DB } from "../../../../../types/db.type.ts";
import type { IdQuery } from "../../../../../types/request.type.ts";
import type { QueryResult } from "mysql2";

export default async function({ db, request, reply } : {db: DB, request: FastifyRequest<{Querystring:IdQuery}>, reply: FastifyReply}) : Promise<void> {
     const userId = request.query.id;
     if (!userId) {
          return await reply.status(400).send({ error: 'User id is required' });
     }

     try {
          const query = `
               SELECT user_id, username, img, description, accounts_selled, assets_selled, services_selled
               FROM Users
               WHERE user_id = ?
          `;
          const results  =  await db<QueryResult[]>(query, [userId]);
          if (results.length === 0) {
               return await reply.status(404).send({ error: 'User not found' });
          }

          return reply.send(results[0]);
     } catch (err) {
          console.error('Error querying users table:', err);
          return await reply.status(500).send({ error: 'Internal server error' });
     }
}
