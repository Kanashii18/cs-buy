import { useEffect, useState } from "react";
import Loadingdiv from "../../../../scripts/loadingdiv.js";

export default function Comment_card({ seller }) {
     const [feedbacks, setFeedbacks] = useState([]);
     const [loading, setLoading] = useState(true);
     const [error, setError] = useState(null);

     useEffect(() => {

     async function fetchFeedbacks() {
          if(!seller.user_id) return;
          try {
               const response = await fetch(`/api/seller/get-feedback`, {
                    method: "POST",
                    headers: {
                    "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ user_id: seller.user_id }),
               });
               if (!response.ok) {
                    throw new Error("Error al obtener feedbacks");
               }
               const data = await response.json();
               console.log(data);
               setFeedbacks(data || []);
          } catch (err) {
               setError(err.message);
          } finally {
               setLoading(false);
          }
     }

     fetchFeedbacks();
     }, [seller]);

     if (loading) return (
          <>
          <article className="flex bg-[#141414] p-2 gap-3 text-white">
               <div className="p-[.15rem] bg-[#161616] w-11 h-11">
                    <Loadingdiv size={"20px"}/>
               </div>
          </article>
          <article className="flex bg-[#141414] p-2 gap-3 text-white">
               <div className="p-[.15rem] bg-[#161616] w-11 h-11">
                    <Loadingdiv size={"20px"}/>
               </div>
          </article>
          </>
     );

     return (
    <>
          {feedbacks.length !== 0 ? 
               <>
                    {feedbacks.map((fb, index) => (
                         <article className="flex bg-[#141414] p-2 gap-3 text-white" key={index}>
                              <div className="p-[.15rem] bg-[#252525]">
                                   <img
                                   className="w-11 h-11"
                                   src={fb.user_img}
                                   alt={`${fb.user_username}'s photo`}
                                   />
                              </div>
                              <section className="flex flex-col flex-1 gap-1 min-w-0 pr-4">
                                   <p className="text-[12px] text-right w-full text-white/90">{fb.user_username}</p>
                                   <p className="truncate text-white/70">{fb.comment}</p>
                              </section>
                         </article>
                    ))}
               </> 
               :  
               <>
               <div className="feedback__message-content" style={{width:"100%", height:"100%", display:"flex", justifyContent:'center', alignItems:"center"}}>
                    <div className="feedback__message-alert text-suboption">
                         <p>There's not comments...</p>
                    </div>
               </div>
               </>
          }
    </>
  );
}
