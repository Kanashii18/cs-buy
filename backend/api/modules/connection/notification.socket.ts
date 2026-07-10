import type {Server, Socket} from "socket.io";
import type { User_Socket } from "../../types/modules/connections/notification.socket.type.ts";

export function notification_network(io : Server, socket: Socket, userId: string){
     // read and notification unread notifications...
     socket.on('unread_check', async (unread_count : User_Socket) => {
          if (unread_count.receiver === userId) {
               io.to(socket.id).emit('unread_check', unread_count);
          }
     });
     // Send notification
     socket.on("notification",(notice: User_Socket)=>{
          if (notice.receiver === userId) {
               io.to(socket.id).emit('notification', notice);
          }
     })
}

