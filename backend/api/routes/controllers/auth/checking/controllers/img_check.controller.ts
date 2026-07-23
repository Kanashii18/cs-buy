import { CLOUDINARY_API_SECRET } from "../../../../../config/env.ts";
import type { FastifyReply, FastifyRequest } from "fastify";
import type { Filter } from "../../../../../types/config_types/filter.type.ts";

export default async function({ ci, request, reply } : {ci : Filter, request: FastifyRequest, reply: FastifyReply}) : Promise<void> {
     try{
          const timestamp = Math.floor(Date.now() / 1000);
          const signature = ci.utils.api_sign_request(
               {
                    timestamp: timestamp,
                    folder: 'imagen_set',
                    moderation: 'webpurify',
               },
               CLOUDINARY_API_SECRET
          );
          await reply.send({ signature, timestamp });
     } catch (err) {
          console.error(err);
          return await reply.status(500).send({ error: 'Internal server error' });
     }
}