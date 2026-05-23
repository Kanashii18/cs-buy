import { io } from "socket.io-client";

let socket = null;

export const createSocket = (token) => {
  if (socket) return socket; // evita duplicados

  socket = io("/", {
    auth: { userId: token },
    transports: ["websocket"],
    withCredentials: true, // recomendado si usas cookies/sesión
  });

  socket.on("connect", () => console.log("✅ connected", socket.id));
  socket.on("connect_error", (e) => console.log("❌ connect_error", e.message));

  return socket;
};

export const getSocket = () => socket;
