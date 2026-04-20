import { useEffect, useState } from "react"

export default function Notifications({LoadingScene}){

     const [loading,setloading] = useState(true);
     const [notifications, setnotification] = useState([]);

     useEffect(()=>{
          (async()=>{
               const res = await fetch(`/api/user/notification`,
                    { credentials: "include", cache: "no-store" }
                    )
               if(!res.ok) return console.error("error notification");
               const data = await res.json();
               setnotification(data);
          })().finally( () => setloading(false))
     },[])

     if(loading) return <LoadingScene/>;

     return (
          <>
               <div className="w-full h-full bg-[#131016] p-4 text-suboption">
                    <div className="w-1/2">
                         <div className="flex w-full p-5 text-[1.48rem] font-roboto font-medium">
                              Notifications
                         </div>
                         <div className="flex flex-col gap-[1.19rem] bg-[#19121f] p-4">
                              {notifications.map((n, index) => (
                              <div
                                   key={index}
                                   className="flex items-center justify-center gap-4 rounded-[3px] bg-[#32233c] px-[0.56rem] py-[0.45rem] transition-colors duration-200 hover:bg-[#4c395e]"
                              >
                                   <div className="w-[50px] h-[50px] aspect-square">
                                        <img
                                             src={n.image}
                                             className="w-full h-full object-cover rounded"
                                        />
                                   </div>
                                   <div className="flex w-full flex-col gap-[0.7rem] font-roboto font-medium">
                                        <div className="flex justify-between gap-20">
                                             <div className="text-[1.1rem] text-[#f2e4ffcc]">
                                                  {n.title}
                                             </div>
                                             <div className="text-[0.9rem] text-white/50">
                                                  {n.timestamp
                                                  .replace('T', ' ')
                                                  .replace('.000Z', '')}
                                             </div>
                                        </div>
                                        <div className="flex justify-between text-[0.87rem] whitespace-nowrap">
                                             <div className="text-[#f2e4ffcc]">
                                                  Product Sold | Buyer: {n.buyer}
                                             </div>
                                             <div>{n.price}$</div>
                                        </div>
                                   </div>
                              </div>
                              ))}
                         </div>
                    </div>
               </div>
          </>
     )
}