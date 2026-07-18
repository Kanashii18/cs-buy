// import type {FastifyRequest, FastifyReply} from "fastify";
// import { randomUUID } from "crypto";
// import { createHmac } from "crypto";

// declare global {
//      namespace FastifyInstance {
//           interface FastifyRequest {
//                deviceId?: string;
//           }
//      }
// }

// const COOKIE = "device_id";

// function sign(id: string): string {
//      return createHmac("sha256", process.env.DEVICE_SECRET || "secret").update(id).digest("hex");
// }

// export default function ensureDevice(request : FastifyRequest, reply : FastifyReply, next: () => void) {
//      const c = request.cookies?.[COOKIE];
//      if (c) {
//           const [id, sig] = c.split(".");
//           if (id && sig && sig === sign(id)) { request.deviceId = id; return next(); }
//      }
//      const id = randomUUID();
//      reply.cookie(COOKIE, `${id}.${sign(id)}`, {
//           httpOnly: false, sameSite: "lax",
//           secure: process.env.NODE_ENV === "production",
//           maxAge: 31536000000, path: "/"
//      });
//      request.deviceId = id;
//      next();
// }
