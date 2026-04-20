export default function seller_card({product, Loadingdiv}){
     return(
          <>   
               <div className="w-min h-[15rem] pt-[10px] pr-[20px] pb-[7px] pl-[20px] mx-4 bg-[hsl(0_0%_7%)]">
                    <div className="flex flex-col mt-10 h-full gap-8 " content="details-user" itemProp="details">
                         <div>
                              <h4>
                                   <strong className="gap-4 text-[24px] border-b-[0.1rem] border-b-[rgba(255,255,255,0.144)] whitespace-nowrap font-[detailsFont] font-light text-white flex">
                                        Delivery Time :{" "}  
                                        
                                        {
                                             product.deliveryUnit ?
                                             <span className="text-[#ffff00] text-[24px] border-b-[0.1rem] border-b-[rgba(255,255,255,0.144)] whitespace-nowrap font-[detailsFont] font-light">
                                                  {product.deliveryUnit}
                                             </span>
                                             :
                                             <div className="w-[3.5rem] h-[1.9rem] object-cover object-center rounded-[75%]">
                                                  <Loadingdiv/> 
                                             </div>
                                        }

                                   </strong>
                              </h4>
                         </div>

                         <div>
                              <h4>
                                   <strong className="text-[24px] border-b-[0.1rem] border-b-[rgba(255,255,255,0.144)] whitespace-nowrap font-[detailsFont] font-light text-white flex">
                                        Warranty period :{" "} 
                                        {
                                             product.deliveryUnit ?
                                             <span className="text-[#ffff00] text-[24px] border-b-[0.1rem] border-b-[rgba(255,255,255,0.144)] whitespace-nowrap font-[detailsFont] font-light">
                                                  10 Days
                                             </span>
                                             :
                                             <div className="w-[79.3px] h-[1.9rem] object-cover object-center rounded-[75%]">
                                                  <Loadingdiv/> 
                                             </div>
                                        }
                                   </strong>
                              </h4>
                         </div>
                    </div>    
               </div>
          </>
     )
}