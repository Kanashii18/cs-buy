
export function notification_network(io, socket){
     // read and notification...
     socket.on('unread_check', async (unread_count) => {
          if (unread_count.receiver === userId) {
               io.to(socket.id).emit();
          }
     });

     socket.on("notification",(notice)=>{
          if (notice.receiver === userId) {
               io.to(socket.id).emit();
          }
     })
}

