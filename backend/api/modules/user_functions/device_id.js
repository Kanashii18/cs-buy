export default function ensureDevice(request, reply) {
     const c = request.cookies?.[COOKIE];
     if (c) {
          const [id, sig] = c.split(".");
          if (id && sig && sig === sign(id)) { request.deviceId = id; return next(); }
     }
     const id = randomUUID();
     reply.cookie(COOKIE, `${id}.${sign(id)}`, {
          httpOnly: false, sameSite: "lax",
          secure: process.env.NODE_ENV === "production",
          maxAge: 31536000000, path: "/"
     });
     request.deviceId = id;
}
