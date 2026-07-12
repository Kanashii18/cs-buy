import readRoomController from "./controllers/readRoom.controller";
import postChatController from "./controllers/postChat.controller";
import getUnreadController from "./controllers/get_unread.controller";

export default function chat_controller(db, request, reply){
     return {     
     // Read chat messages in the indicate chat
     readRoom: readRoomController({db, request, reply}),
     // Send new message in the indicate chat
     postChat: postChatController({db, request, reply}),
     // Get unread messages
     get_unread: getUnreadController({db, request, reply})}
};