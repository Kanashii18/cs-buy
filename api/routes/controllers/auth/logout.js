export function logout(request, reply) {
     reply.clearCookie("session_token", {
          httpOnly: true,
          secure: false,
          sameSite: "Strict",
          path: "/"
     });
     reply.status(200).send({ message: "Sesión cerrada correctamente..." });
}