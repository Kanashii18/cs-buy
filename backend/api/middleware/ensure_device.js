export default async function ensureDevice(request, reply) {
     
     // Fastify plugins...
     const sign = v => crypto.createHmac("sha256", process.env.DEVICE_SECRET).update(v).digest("base64url");
     const COOKIE = "__did";

     const c = request.cookies?.[COOKIE];
     if (c) {
          const [id, sig] = c.split(".");
          if (id && sig && sig === sign(id)) {
               request.deviceId = id;
               return;
          }
     }
     const id = crypto.randomUUID();
     reply.setCookie(COOKIE, `${id}.${sign(id)}`, {
          httpOnly: false,
          sameSite: "lax",
          secure: process.env.NODE_ENV === "production",
          maxAge: 31536000000,
          path: "/"
     });
     request.deviceId = id;
}