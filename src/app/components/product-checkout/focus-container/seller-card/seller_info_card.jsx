export default function seller_card({seller, Loadingdiv}){
     return(
          <>
               <div className="flex w-full gap-[8%] pl-[5%] justify-center items-center">
                    <a href={`/dashboard/profile?id=${seller.user_id}`} className="contents">
                         <div className="overflow-hidden rounded-[50%] flex justify-center items-center aspect-square">
                              
                              {
                                   seller.img && seller.username ?
                                   <img
                                        src={seller.img}
                                        alt={seller.username}
                                        className="w-[2.4rem] h-[2.4rem] object-cover object-center rounded-[75%]"
                                   />
                                   :
                                   <div className="w-[2.4rem] h-[2.4rem] object-cover object-center rounded-[75%]">
                                        <Loadingdiv/> 
                                   </div> 
                                   
                              }
                         </div>
                         <h3> 
                              {
                                   seller.img && seller.username ?
                                   <strong className="text-[hsl(0_0%_80%)]">
                                        {seller.username}
                                   </strong>
                                   :
                                   <div className=" w-16 h-5.5 bg-white/5">
                                             <Loadingdiv/>
                                   </div>         
                         }         
                         </h3>
                    </a>
               </div>

               <div className="flex w-full gap-4 text-[1.2rem] pl-[1%] justify-center items-center">
                    {
                                   seller.img && seller.username ?
                                   <h4 className="text-product">
                                        {seller.rate}%
                                   </h4>
                                   :
                                   <div className=" w-16 h-5.5 bg-white/5">
                                             <Loadingdiv/>
                                   </div>
                    }
                    
                    <img
                         src="../assets/icons/star.svg"
                         alt="star icon"
                         className="w-[22px]"
                    />
               </div>
          </>
     )

}