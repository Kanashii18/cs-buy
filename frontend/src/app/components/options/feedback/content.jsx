import Recent_order from "./feedback-recent-card";
import Feedback_card from "./feedback-commentary";
import { useEffect, useState } from "react";
import setLocal_date from "../../../scripts/set_date";
import LoadingText from "../../../scripts/loadingText";

export default function Feedback({user, LoadingScene}){


     const fetch_base = async(res) => {
          if(!res.ok){
               return console.error("Error getting feedbacks");
          }
          const data = await res.json();
          return data;
     } 
     const user_info = user;

     const [feedback, setFeedbacks] = useState(null);
     const [rating, setRating] = useState(null);
     const [selled, setSelled] = useState({
          "total_service":"..",
          "total_account":".."
     });
     const [orders, setOrders] = useState(null);
     const [loading, setLoading] = useState(true);

     const request = async(url) => {
          const res = await fetch(url, {
               credentials: "include",
               method: "GET",
               headers: {
                    "Cache-Control": "no-cache"
               }
          })
          if(!res.ok) {
               throw new Error("error getting product");
          }
          const data = await res.json();
          return data;
     }
     
     useEffect(() => {
          (async()=>{

               // GET AL FEEDBACKS...
               const all = await request("/api/seller/all-feedback");
               let setData = all.feedbacks
                    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at)) // Ordenar de más reciente a más antiguo
                    .map(feedback => {
                         return {
                              ...feedback,
                              created_at: setLocal_date(feedback.created_at) // Aplicar setLocal_date
                         };
                    });
               setFeedbacks(setData);

               // GETTING AL SELLED PRODUCTS...
               // =============================================================== //
               const selled = await request("/api/seller/total-selled");
               setSelled(selled);

               // GETING ALL RECENT PRODUCT SELLED 
               // ============================================================== //
               const recent = await request("/api/seller/order/recent");
               setData = recent.map(order => {
                    return {
                         ...order,
                         time:setLocal_date(order.time)
                    };
               });
               setOrders(setData);

               // GETTING PROFILE RANKING RATE, EXAMPLE 90%
               const rating = await request("/api/seller/order/recent");
               setRating(rating.rating_value);
               setLoading(false);
          })()
          .catch((err) => console.error("Error de sesión:", err));
     }, []);

     const sortFeedbacks = (order) => {
          const sorted = [...feedback].sort((a, b) => {
               if (order === 'best') {
                    return b.stars - a.stars; // De mayor a menor estrellas
               } else {
                    return a.stars - b.stars; // De menor a mayor estrellas
               }
          });
          setFeedbacks(sorted);
     };

     // if(loading) return <LoadingScene/>;
     
     return(
          <div className="flex justify-center w-full h-full text-white/85">
               <div className="flex w-full justify-evenly h-min p-4 pr-10 pl-10 gap-32 bg-[#131016] max-[65.06rem]:gap-[.7rem] max-[65.06rem]:flex-col-reverse max-[65.06rem]:min-h-0 max-[65.06rem]:items-center max-[65.06rem]:max-h-none max-[56.89rem]:gap-[.7rem] max-[56.89rem]:items-center max-[56.89rem]:flex-col-reverse max-[56.89rem]:min-h-0 max-[56.89rem]:max-h-none max-[32rem]:flex-col-reverse max-[32rem]:gap-8 max-[32rem]:justify-center max-[32rem]:items-center max-[32rem]:p-[.4rem]">
                    <div className="flex flex-col p-4 gap-8 w-full bg-[#17121f] h-min min-[1021px]:min-w-[37.4rem] max-[65.06rem]:w-[90%] max-[56.89rem]:w-[90%] max-[32rem]:w-full max-[32rem]:p-2">
                         <div className="flex flex-col gap-8">
                              <div className="w-full">
                                   <div className="w-1/2 bg-[#281e35] py-4 px-[2.2rem] flex justify-between items-center max-[32rem]:w-min max-[32rem]:gap-4">
                                        <h3 className="text-[1.5rem]">{user_info?.username?.length > 0 ? user_info.username : <LoadingText speed={50}/>}</h3>
                                        <div className="w-3 h-3 bg-[#4cf136] rounded-full"></div>
                                   </div>
                              </div>

                              <div className="flex gap-4">
                                   <div className="bg-[#281e35] py-[.8rem] px-4 text-center" id="services-option">
                                        <h4>Services {selled.total_service}</h4>
                                   </div>
                                   <div className="bg-[#281e35] py-[.8rem] px-4 text-center" id="accounts-option">
                                        <h4>Accounts {selled.total_account}</h4>
                                   </div>
                              </div>
                         </div>

                         <div className="flex flex-col gap-8">
                              <div className="w-full py-2 px-[1.2rem] flex gap-14 items-center">
                                   <h3 className="text-[1.4rem]">Comments</h3>
                                   <div className="feedback_option-div">
                                        <button onClick={() => sortFeedbacks('best')} className="cursor-pointer py-[.8rem] px-6 bg-[#281e35] rounded-[4.5px] transition-[background-color] duration-[400ms] ease-in-out hover:bg-[#4a3763]">
                                             Best
                                        </button>
                                   </div>
                                   <div className="feedback_option-div">
                                        <button onClick={() => sortFeedbacks('worst')} className="cursor-pointer py-[.8rem] px-6 bg-[#281e35] rounded-[4.5px] transition-[background-color] duration-[400ms] ease-in-out hover:bg-[#4a3763]">
                                             Worst
                                        </button>
                                   </div>
                              </div>

                              <div className="bg-[#281e35] p-4 flex flex-col gap-[1.34rem] max-h-[32rem] overflow-scroll [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden max-[32rem]:flex max-[32rem]:justify-center">
                                   <Feedback_card feedbacks={feedback} loading={loading}/>
                              </div>
                         </div>
                    </div>

                    <div className="w-min h-min max-h-[41.164rem] min-h-[41.164rem] flex flex-col gap-8 p-4 bg-[#17121f] max-[65.06rem]:max-h-[41.164rem] max-[65.06rem]:w-[86.1%] max-[56.89rem]:w-[86.1%] max-[32rem]:w-full max-[32rem]:max-h-none max-[32rem]:min-h-auto">
                         <div style={{display:'contents'}}>
                              <div className="flex flex-col bg-[#281e35]">
                                   <h4 id="rating-text" className="absolute text-[.6rem] p-2 whitespace-nowrap">Actual Rating</h4>
                                   <h3 id="rating-value" className="text-[1.8rem] py-[.9rem] px-8 my-[.7rem] mx-8 whitespace-nowrap text-center text-[rgba(255,255,205,0.945)]">{rating ? rating : 0 } %</h3>
                              </div>

                              <div className="bg-[#281e35] py-2 px-4 w-min">
                                   <h4 className="text-[1.25rem] px-[0.4rem] font-sans">Recent</h4>
                              </div>

                              <div className="bg-[#281e35] p-4 overflow-scroll flex flex-col gap-8 max-h-[41.164rem] [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden max-[32rem]:p-4 max-[32rem]:px-[.4rem]">
                                   <Recent_order orders={orders}/>
                              </div>
                         </div>
                    </div>
               </div>
          </div>
     )
}