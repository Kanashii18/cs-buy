import { useState, useEffect, useRef } from "react";
import ChatContainer from "./chat-container";
import WaitingContainer from "./waiting-message";
import Loadingdiv from "../../../scripts/loadingdiv";

export default function Chat({ user, LoadingScene, newSocket }) {

     const [conversations, setConversations] = useState([]);  // Lista de conversaciones
     const [user2, setUser2] = useState(null);  // Usuario con el que se va a chatear
     const [listener, setListener] = useState(null);
     const [timestamp, setTimestap] = useState(null);
     const [chatId, setChatId] = useState(null);  // ID de la conversación seleccionada
     const [initialMessages, setInitialMessages] = useState([]);  // Mensajes iniciales
     const [loading, setLoading] = useState(true);
     const [loadingMessage, setLoadingMessages] = useState(false);
     const [waitingChat, setWaiting] = useState(false);
     const ran = useRef(false);

     const user1 = user;  // Usuario actual

     // Obtener las conversaciones al montar el componente
     useEffect(() => {
          if (ran.current || !newSocket) return;
          ran.current = true;
          (async()=>{
               const res = await fetch("/api/chat/overview", {
                    credentials: "include",
                    method: "GET",
               });

               const overviewData = await res.json();
               if (!newSocket.connected) {
                    newSocket.connect();
               }
               const enrichedData = await Promise.all(
                    
                    overviewData.map(async (conv) => {
                         const userRes = await fetch(`/api/auth/user-check?id=${conv.other_id}`, {
                              credentials: "include",
                              headers: { "Cache-Control": "no-cache" },
                         });

                         const userData = await userRes.json();
                         // check if the user on messages is online
                         let userId = conv.other_id; 
                         const isOnline = await new Promise(resolve => {
                              newSocket.emit("user:isOnline", { userId }, res => {
                                   console.log(res);
                                   resolve(res.isOnline);
                              });
                         });
                         console.log("mi vidaaaaaaaaaaaaaaa",isOnline);

                         return {
                              ...conv,
                              username: userData.username,
                              img: userData.img,
                              active: isOnline
                         };
                    })
               );  
               setConversations(enrichedData);
               console.log(enrichedData);    
               console.log(conversations);
               setLoading(false);
          })()
     }, [newSocket]);

     // Función para cargar los mensajes de la conversación seleccionada
     useEffect(() => {
          if (user2 && chatId) {
               (async()=>{
                    setLoadingMessages(true);
                    const listener = conversations.find(e => e.other_id === user2.user_id)?.listing_id
               
                    let res = await fetch(`/api/chat/listener?id=${listener}&u=${user1.id}&s=${user2.user_id}`, {
                         method: "GET",
                         credentials:"include"
                    })
                    if(!res.ok) return console.error("Error listening chat");
                    let data = await res.json(); 

                    setTimestap(data.created_at
                              .replace('T', ' ')
                              .replace('.000Z', ''));
                    setListener(data);

                    res = await fetch(`/api/chat/messages`, {
                              method: "POST",
                              headers: { 'Content-Type': 'application/json' },
                              credentials: "include",
                              body: JSON.stringify({
                                   roomId: chatId
                              })
                         })
                    if(!res.ok) return console.error("Error getting messages");
                    data = await res.json();
                    setInitialMessages(data);
                    setWaiting(false);
                    
               })()
                    .catch(()=>{
                         console.error("Error getting chat");
                    })
                    .finally(()=>{
                         setLoadingMessages(false);
                    })
               
          }
     }, [user2, chatId]);  // Solo se ejecuta cuando user2 o chatId cambian

     // Manejar la selección de un usuario (cuando se hace clic en un contacto)
     const handleSelectClient = async (id, otherId, unread_count) => {
          if(unread_count > 0){
               await fetch(`/api/chat/markAsRead`, {
                    credentials: 'include',
                    method:"PUT",
                    body:JSON.stringify({
                         id:otherId
                    }),
                    headers: {
                         "Content-Type":"application/json",
                         "Cache-Control": "no-cache" 
                    }
               });
          }
          setLoadingMessages(true);
          setWaiting(true);

          
          setConversations(prev =>
               prev.map(conv =>
                    conv.id === id ? { ...conv, unread_count: 0 } : conv
               )
          );

          try {
               const res = await fetch(`/api/auth/user-check?id=${otherId}`, {
                    credentials: 'include',
                    headers: { "Cache-Control": "no-cache" }
               });
               const data = await res.json();

               setUser2(data); 
               setChatId(id);

               // setConversations(prev =>
               //      prev.map(conv =>
               //           conv.id === id ? { ...conv } : conv
               //      )
               // );
          } catch (error) {
               console.error(error);
          }finally{
               setLoadingMessages(false);
          }
     };

     // if(loading) return <LoadingScene/>;

    return (
     <>
          <div className="grid-colums-layer h-full w-full bg-[rgb(5,5,5)] p-[0.8rem] max-[32.6rem]:p-[0.4rem]">
               <div className="grid-colums grid gap-[2.1rem] p-4 h-auto w-full bg-[rgb(19,16,22)] grid-cols-[0.4fr_1fr] max-[64rem]:grid-cols-1 max-[52.3125rem]:grid-cols-1 max-[32.6rem]:p-[0.4rem]">
                    <section className="contacts-layer flex flex-col justify-start justify-self-start p-4 w-full h-full bg-[rgb(23,18,31)] max-[52.3125rem]:w-[98%] max-[52.3125rem]:justify-self-center max-[32.6rem]:w-full text-white">
                         <div className="pt-2 px-[1.2rem] pb-[1.4rem]">
                              <h3>Messages</h3>
                         </div>

                         <div className="flex flex-col max-h-[43.5975rem] gap-4">
                              
                              {loading ? 
                                   <>
                                   <div>
                                        <div className="flex w-[90%] h-[2.6rem] rounded-[3px] bg-[rgb(40,30,53)] text-center justify-self-center justify-between px-[2.78rem] items-center gap-4 cursor-pointer">
                                             <div className="side-content flex gap-4 items-center">
                                                  <div className="is_active_layer w-auto"> 
                                                       <div className={`is_active_user w-[0.67rem] h-[0.67rem] rounded-full bg-[#797979]`}></div>
                                                  </div>
                                                  <div className=" w-16 h-5.5 bg-white/5">
                                                  <Loadingdiv/>
                                                  </div>
                                             </div>
                                             <div className=" w-4 h-5.5 bg-white/5">
                                                  <Loadingdiv/>
                                             </div>
                                        </div>
                                   </div>
                                   <div>
                                        <div className="flex w-[90%] h-[2.6rem] rounded-[3px] bg-[rgb(40,30,53)] text-center justify-self-center justify-between px-[2.78rem] items-center gap-4 cursor-pointer">
                                             <div className="side-content flex gap-4 items-center">
                                                  <div className="is_active_layer w-auto"> 
                                                       <div className={`is_active_user w-[0.67rem] h-[0.67rem] rounded-full bg-[#797979]`}></div>
                                                  </div>
                                                  <div className=" w-16 h-5.5 bg-white/5">
                                                  <Loadingdiv/>
                                                  </div>
                                             </div>
                                             <div className=" w-4 h-5.5 bg-white/5">
                                                  <Loadingdiv/>
                                             </div>
                                        </div>
                                   </div>
                                   </>
                                  :
                                   <>
                                   {conversations.length <= 0 ? (()=>{
                                        {conversations.map(({ id, other_id, username, unread_count = 0, active}) => (
                                             <div
                                                  key={id}
                                                  onClick={() => handleSelectClient(id, other_id, unread_count)}
                                             >
                                                  <div className="flex w-[90%] h-[2.6rem] rounded-[3px] bg-[rgb(40,30,53)] text-center justify-self-center justify-between px-[2.78rem] items-center gap-4 cursor-pointer">
                                                       <div className="side-content flex gap-4 items-center">
                                                            <div className="is_active_layer w-auto">
                                                                 
                                                                 <div className={`is_active_user w-[0.67rem] h-[0.67rem] rounded-full ${active ? "bg-[#4cf136]" : "bg-[#797979]"}`}></div>
                                                            </div>
                                                            {username}
                                                       </div>
                                                       {unread_count === 0 ? <></>
                                                       :
                                                            <div className="message-count-layer rounded-[6px] bg-[#865799] px-[0.37rem] py-[0.05rem] font-medium font-['Roboto'] text-[.9rem] text-[#ffffffd4]">
                                                                 {unread_count}
                                                            </div>
                                                       }
                                                  </div>
                                             </div>
                                        ))}
                                   })()
                                   :    
                                        <div className="p-4 bg-[#5e4b714d]">
                                             <span className="max-sm:pl-5 text-white/60 font-product">Without Conversations Yet</span>
                                        </div>
                                   }
                                   </>
                         }

                         </div>
                    </section>

                    {loadingMessage ? (
                         <>
                         <WaitingContainer user2={user2} LoadingScene={LoadingScene} />
                         </>
                    ) : (
                         <>
                         {chatId && listener && (
                         <ChatContainer
                              user1={user1}
                              user2={user2}
                              listener={listener}
                              statusChat={waitingChat}
                              timestamp={timestamp}
                              initialMessages={initialMessages}
                              chatId={chatId}
                              LoadingScene={LoadingScene}
                         />
                         )}
                         </>
                    )}
               </div>
          </div>
          </>
     );
}
