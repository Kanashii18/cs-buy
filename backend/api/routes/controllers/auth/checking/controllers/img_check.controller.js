import { CLOUDINARY_API_SECRET } from "../../../../../config/env";

export default function({ ci, reply }) {
     const timestamp = Math.floor(Date.now() / 1000);
     const signature = ci.utils.api_sign_request(
          {
               timestamp: timestamp,
               folder: 'imagen_set',
               moderation: 'webpurify',
          },
          CLOUDINARY_API_SECRET
     );

     return reply.send({ signature, timestamp });
}
