import {createHmac, UUID} from "crypto";
import type {FastifyRequest, FastifyReply} from "fastify";
import { Req_Device } from "../types/middleware/ensure_device.type.js";

export default async function ensureDevice(request:FastifyRequest & Req_Device, reply:FastifyReply) {
     
     // Fastify plugins...
     const sign = (v:string) => createHmac("sha256", process.env.DEVICE_SECRET).update(v).digest("base64url");
     const COOKIE = "__did";

     const c = request.cookies?.[COOKIE];
     if (c) {
          const [id, sig] = c.split(".");
          if (id && sig && sig === sign(id)) {
               request.deviceId = id;
               return;
          }
     }
     const id : UUID = crypto.randomUUID();
     reply.setCookie(COOKIE, `${id}.${sign(id)}`, {
          httpOnly: false,
          sameSite: "lax",
          secure: process.env.NODE_ENV === "production",
          maxAge: 31536000000,
          path: "/"
     });
     request.deviceId = id;
}