import { useEffect, useState, useRef } from "react";
import { getSocket } from "../../../scripts/socket";

import WaitingContainer from "./waiting-message";
import Message_card from "./message-card";

export default function ChatContainer({
          user1,
          user2,
          listener,
          statusChat,
          timestamp,
          initialMessages = [],
          chatId,
          LoadingScene,
     }) {
     const [messages, setMessages] = useState([]);
     const roomId = chatId;
     const [inputText, setInputText] = useState("");

     const chatContentRef = useRef(null);

     const handleSend = () => {
     if (!inputText.trim()) return;
     sendMessage(inputText.trim());
     setInputText("");
     };

     useEffect(() => {
     if (!roomId) {
          console.log("sin room");
          return;
     }
     {
          console.log("la room esta bien", roomId);
     }
     const socket = getSocket();
     console.log("ya llamando el join roomm.....");
     socket.emit("join_room", roomId);

     socket.on("receive_message", (msg) => {
          console.log(msg);
          setMessages((prev) => [...prev, msg]);
     });

     return () => {
          socket.off("receive_message");
          socket.emit("leave_room", roomId);
     };
     }, [roomId]);

     useEffect(() => {
     if (initialMessages) {
          setMessages(initialMessages || []);
          console.log(initialMessages);
     }
     }, [initialMessages]);

     const sendMessage = (text) => {
     if (!roomId) {
          return;
     }
     const socket = getSocket();
     const message = {
          roomId,
          sender_id: user1.id,
          text,
          timestamp: Date.now(),
     };

     socket.emit("send_message", message);

     fetch(`/api/chat/messages`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
          roomId: chatId,
          message: text,
          recibe_id: user2.user_id,
          }),
     })
          .then((res) => res.json())
          .then((data) => {
          console.log("Mensaje guardado:", data);
          })
          .catch(console.error);
     };

     useEffect(() => {
     if (chatContentRef.current) {
          chatContentRef.current.scrollTop = chatContentRef.current.scrollHeight;
     }
     }, [messages]);

     if (statusChat) return <WaitingContainer LoadingScene={LoadingScene} />;

     return (
     <>
          <section className="chat-container-layer flex flex-col gap-6 p-[1.4rem] rounded-[2px] w-full h-full bg-[rgb(23,18,31)] max-[52.3125rem]:w-[98%] max-[52.3125rem]:justify-self-center max-[32.6rem]:w-full max-[32.6rem]:p-[1.4rem_0.2rem]">
          {user2 ? (
               <>
               <div className="information-layer grid mt-[.9rem] grid-cols-[auto_auto] gap-[4.5rem]">
                    <div className="product-info-layer">
                         <a
                         className="product-info-content flex gap-4 bg-[#26192e] p-[.2rem] rounded-[5px]"
                         href={`/product?id=${listener.product_id}`}
                         >
                         <div className="product_img p-[.2rem] bg-[#1a141a]">
                              <img
                              className="object-cover w-[3.8rem] h-[3.8rem]"
                              src={listener.image}
                              alt="image product"
                              />
                         </div>
                         <div className="product-information flex flex-col justify-between my-1">
                              <div className="product_title text-[#d2c7e6] [font-family:math]">
                              {listener.title}
                              </div>
                              <div className="product_time text-[#d2c7e6] [font-family:math]">
                              {timestamp}
                              </div>
                         </div>
                         </a>
                    </div>

                    <div className="username-focus-layer flex justify-center w-full h-full items-center">
                         <a
                         href={`/dashboard/profile?id=${user2.user_id}`}
                         className="username-focus-chat flex justify-center items-center bg-[#26192e] h-full w-full max-h-[3.4rem] rounded-[6px] max-[32.6rem]:w-[91.9%]"
                         >
                         <h2 className="text-[rgb(239,230,248)]">{user2.username}</h2>
                         </a>
                    </div>
               </div>

               <div className="chat-div max-[32.6rem]:grid max-[32.6rem]:justify-items-center max-[32.6rem]:p-[0.6rem]">
                    <div
                         className="chat-content flex flex-col bg-[#100b16] min-h-[32rem] max-h-[32rem] rounded-[10px] px-4 py-2 overflow-y-auto [scroll-behavior:smooth] items-center p-6 gap-3 my-4 max-[32.6rem]:p-2 max-[32.6rem]:w-full max-[32.6rem]:min-h-[26rem] max-[32.6rem]:max-h-[26rem]"
                         ref={chatContentRef}
                    >
                         {messages.length === 0 ? (
                         <></>
                         ) : (
                         <div className="chat-messages mt-auto w-full flex flex-col gap-[0.15rem]">
                              {messages.map((msg, i) => (
                              <Message_card
                                   key={msg.message_id ?? `${msg.timestamp}-${i}`}
                                   user={msg.sender_id === user1.id ? user1 : user2}
                                   self={msg.sender_id === user1.id}
                                   text={msg.text}
                              />
                              ))}
                         </div>
                         )}
                    </div>

                    <div className="chat-options flex justify-center items-center bg-[rgb(58,51,71)] h-[2.4rem] px-4 rounded gap-[0.9rem] max-[32.6rem]:w-full">
                         <input
                              className="bg-[rgb(58,51,71)] w-full h-full list-none focus:outline-none focus:border-0 text-suboption"
                              type="text"
                              value={inputText}
                              onChange={(e) => setInputText(e.target.value)}
                              onKeyDown={(e) => {
                                   if (e.key === "Enter") {
                                   handleSend();
                                   }
                              }}
                              placeholder="Escribe un mensaje..."
                         />
                         <div
                              className="send-button cursor-pointer"
                              onClick={handleSend}
                              style={{ cursor: "pointer" }}
                         >
                              <img src="../assets/icons/send.svg" alt="Enviar" />
                         </div>
                    </div>
               </div>
               </>
          ) : (
               <div>¡Qué tal una charla!</div>
          )}
          </section>
     </>
     );
}
