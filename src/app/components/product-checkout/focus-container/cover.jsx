import LoadingText from "../../../scripts/loadingText";

export default function Cover_product({product, Loadingdiv}){
     return(
          <>
               <div className="bg-[hsl(0,0%,7%)] px-2 py-[0.4rem] flex justify-center items-center whitespace-nowrap max-[38rem]:bg-[hsl(0,0%,7%)] max-[38rem]:mx-4 max-[38rem]:my-[0.8rem] max-[38rem]:px-[0.3rem] max-[38rem]:py-[0.6rem] max-[38rem]:h-auto max-[38rem]:w-[96%] max-[38rem]:justify-center max-[38rem]:justify-self-center max-[38rem]:items-center">
                    <div>
                         <strong className="text-[rgb(194,190,190)] text-[1.1rem] font-['Lucida_Sans','Lucida_Sans_Regular','Lucida_Grande','Lucida_Sans_Unicode',Geneva,Verdana,sans-serif] tracking-[0.2%] max-[38rem]:text-[0.85rem]" style={{fontFamily:"serif"}}>
                              {product.title}
                         </strong>
                    </div>
               </div>
               <div>

               </div>
               <div className="flex justify-center items-center w-max max-[38rem]:flex max-[38rem]:h-auto max-[38rem]:justify-center max-[38rem]:items-center">
                         {
                              product.image ? 
                                   <img className="h-[28.77rem] w-[28.77rem] object-cover block max-[52.25rem]:h-[15.61rem] max-[52.25rem]:w-[22.77rem] max-[38rem]:h-[15.61rem] max-[38rem]:w-[22.77rem]" src={product.image} alt="product image" />
                              :
                                   <div className="h-[28.77rem] w-[28.77rem] object-cover block max-[52.25rem]:h-[15.61rem] max-[52.25rem]:w-[22.77rem] max-[38rem]:h-[15.61rem] max-[38rem]:w-[22.77rem]">
                                        <Loadingdiv/>
                                   </div>
                                   
                         }
               </div>
          </>
     )

}