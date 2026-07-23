import { FastifyReply, FastifyRequest } from "fastify";
// clear session_token cookie
export default async function logout(request : FastifyRequest, reply : FastifyReply) : Promise<void> {
     await reply.clearCookie("session_token", {
          httpOnly: true,
          secure: false,
          sameSite: "strict",
          path: "/"
     });
     await reply.status(200).send({ message: "Sesión cerrada correctamente..." });
}