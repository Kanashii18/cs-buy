import LoadingText from '../../scripts/loadingText';
import Loadingdiv from '../../scripts/loadingdiv';
// import Order_Content from './content';
import { useState, useEffect } from 'react';

export default function Order({LoadingScene, newSocket}) {

     // const id_param = new URLSearchParams(window.location.search);
     // let id = id_param.get("o");

     // if (id) {
     //      return <Order_Content LoadingScene={LoadingScene} newSocket={newSocket}/>
     // }

     const [orders, setOrders] = useState([]);
     const [loading, setLoading] = useState(true);

     useEffect(() => {
          (async()=>{
               const res = await fetch('/api/order/list',{credentials:"include"});
               if (!res.ok) {
                    console.error("Error getting order list");
                    return;
               }
               const data = await res.json();
               setOrders(data);
          })()
               .finally(()=> setLoading(false));
     }, []);

     const loading_comp = <>
          <div
               className="flex__product-content product__content-list flex gap-4 justify-self-start [word-break:break-all] bg-[rgb(71_59_90)] py-[.4rem] px-[.2rem] w-full max-[38rem]:[word-break:normal]"
          >
               <div className="image__div-layer image__list-layer w-min h-min bg-[rgb(33,20,41)] p-[.4rem] p-[.2rem]">
                    <div className="product__image-div image__div-list">
                         <div
                              className="max-w-max overflow-hidden w-12 h-12 object-cover aspect-square"
                              alt="product image"
                         >
                              <Loadingdiv/>
                         </div>
                    </div>
               </div>
               <div className="w-full h-min flex flex-col break-words font-semibold">
                    <div className="w-full p-[0.2rem]">
                         <div className="pr-4 max-[38rem]:pr-0">
                              <div className=" w-16 h-5.5 bg-white/5">
                              <Loadingdiv/>
                         </div>
                         </div>
                    </div>

                    <div className="flex justify-between items-center pl-[0.2rem] pr-[0.2rem] text-[17px]">
                         <div className=" w-16 h-5.5 bg-white/5">
                              <Loadingdiv/>
                         </div>
                         <div className=" w-16 h-6 bg-white/5">
                              <Loadingdiv/>
                         </div>
                    </div>
               </div>
          </div>
     </>

     return(
          <>
          <div className="order__list-layer bg-[rgb(19,16,22)] p-4 w-full h-full">
                         <div className="order__list-div bg-[rgb(31_26_37)] p-4 flex flex-col gap-[1.2rem] w-1/2 overflow-y-scroll max-h-[51rem] max-[38rem]:w-full text-suboption">
                         <div className="order__list-title text-[1.5rem] my-4 font-sans">
                              <h4>Orders</h4>
                         </div>
                         {
                              loading ? 
                              <>
                                   {loading_comp}
                                   {loading_comp}
                                   {loading_comp}
                              </>
                              
                              :
                              <>
                              {orders.length === 0 ? 
                                   <div className='text-suboption max-sm:p-12'>
                                        No Orders Yet...
                                   </div>
                              :
                              <>
                              {orders.map((order, index) => (
                                   <a key={index} href={`/dashboard/order?o=${order.order_id}`}>
                                        <div
                                             key={index}
                                             className="flex__product-content product__content-list flex gap-4 justify-self-start [word-break:break-all] bg-[rgb(71_59_90)] py-[.4rem] px-[.2rem] w-full max-[38rem]:[word-break:normal]"
                                        >
                                             <div className="image__div-layer image__list-layer w-min h-min bg-[rgb(33,20,41)] p-[.4rem] p-[.2rem]">
                                                  <div className="product__image-div image__div-list">
                                                       <img
                                                            className="max-w-max overflow-hidden w-12 h-12 object-cover aspect-square"
                                                            src={order.product_image}
                                                            alt="product image"
                                                       />
                                                  </div>
                                             </div>
                                             <div className="w-full h-min flex flex-col break-words font-semibold">
                                                  <div className="w-full p-[0.2rem]">
                                                       <div className="pr-4 max-[38rem]:pr-0">
                                                            <h5 className="max-[38rem]:overflow-hidden max-[38rem]:whitespace-nowrap max-[38rem]:w-48">
                                                                 {/* text-overflow: ellipsis no existe como utility en Tailwind */}
                                                                 {order.product_title}
                                                            </h5>
                                                       </div>
                                                  </div>

                                                  <div className="flex justify-between items-center pl-[0.2rem] pr-[0.2rem] text-[17px]">
                                                       <h5>{order.created_at.replace('T', ' ')
                                                                           .replace('.000Z', '')}</h5>

                                                       {order.status === "pending" ? (
                                                            <div className="bg-[#4525fa] text-[0.8rem] text-center p-[0.3rem] rounded-[3px]">
                                                                 pending
                                                            </div>
                                                       ) : (
                                                            <div className="bg-[#3f816e] text-[0.8rem] text-center p-[0.3rem] rounded-[3px]">
                                                                 confirmed
                                                            </div>
                                                       )}
                                                  </div>
                                             </div>
                                        </div>
                                   </a>
                              ))}
                              </>
                              }
                              </>
                         }
                    </div>
               </div>
          </>
     );
}
