export default function Recent_order({orders}){

     const noorders = orders <= 0;
     return (
          <>
               {noorders ? (
                    <div className="flex flex-col justify-center items-center bg-[#17121f] p-8 text-suboption">
                         <div className="w-51.5">
                              <img
                                   src="/data/images/mascots/sleeping.png"
                                   alt=""
                                   className="w-full"
                              />
                         </div>
                         <h4>Nothing here...</h4>
                    </div>
               ) : (
                    <>
                         {orders.map((order, i) => {
                              return (
                                   <div key={i} className="flex gap-4 bg-[#281e35] px-[0.7rem] py-[0.4rem] whitespace-nowrap">
                                        <div className="flex items-center">
                                             <h4 className="text-white/50">
                                                  {order.time} ago
                                             </h4>
                                        </div>

                                        <div className="flex items-center justify-center gap-[0.8rem] max-[32rem]:justify-between max-[32rem]:w-full max-[32rem]:gap-[0.55rem]">
                                             <div className="bg-[#17121f] w-[1.8rem] h-[1.8rem] flex justify-center items-center">
                                                  <img
                                                       src={order.product_image}
                                                       className="w-full h-full object-cover"
                                                  />
                                             </div>

                                             <div>
                                                  <h4 className="overflow-hidden text-ellipsis max-[32rem]:max-w-[7.4rem] max-[24.4375rem]:max-w-[4.8rem] max-[22.5rem]:max-w-[4.4rem] max-[22.89rem]:max-w-[6.4rem]">
                                                       {order.product_title}
                                                  </h4>
                                             </div>

                                             <div>
                                                  <h4 className="text-white/40">
                                                       $ {order.price_at_purchase}
                                                  </h4>
                                             </div>
                                        </div>
                                   </div>
                              );
                         })}
                    </>
               )}
          </>
     );
}