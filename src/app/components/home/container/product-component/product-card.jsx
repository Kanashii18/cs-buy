import { useState, useEffect } from 'react';

export default function ProductCard({ product }) {

     const [discount, setDiscount] = useState(null);

     useEffect(() => {
          if (product && product.discount) {
               setDiscount(product.discount.hasDiscount);
          }
     }, [product]);

  return (
     <>
          <div className="w-60 justify-self-center max-[38rem]:flex max-[38rem]:w-full max-[38rem]:h-full max-[38rem]:justify-center">
               <article
                    id={product.product_id}
                    className="relative z-[1] h-auto p-[0.43rem] max-sm:p-[0.13rem] bg-white/10 flex flex-col justify-start items-center text-[#2e1a1a] rounded-[3px] overflow-hidden [container-type:inline-size] before:content-[''] before:absolute before:inset-[-2px] before:bg-[conic-gradient(from_0deg,transparent_0deg_10deg,#492770_20deg_180deg,#381b57_180deg_320deg,transparent_320deg_360deg)] before:rounded-[20px] before:animate-[spin-glow_6s_linear_infinite] before:blur-[38px] before:brightness-[3.3] before:-z-[1] max-[38rem]:w-full max-[38rem]:h-auto max-[38rem]:min-w-[18rem] max-[38rem]:aspect-square max-[38rem]:h-full max-[38rem]:w-full max-[38rem]:flex max-[38rem]:justify-center"
               >
                    {/* globals.css needed:
                        @keyframes spin-glow { to { transform: rotate(360deg); } }
                    */}
                    <a
                         href={`product?id=${product.product_id}`}
                         aria-label={`View details for ${product.title}`}
                         itemProp="url"
                         itemScope
                         itemType="http://schema.org/Product"
                         className="no-underline bg-[#0d1412] w-full flex flex-col max-[38rem]:grid max-[38rem]:grid-cols-1 max-[38rem]:[grid-template-rows:0.34fr_1fr] max-[38rem]:gap-1 max-[38rem]:p-3 max-[38rem]:w-[95%] max-[38rem]:h-[95%] max-[38rem]:bg-black"
                    >
                         <div className="contents max-[38rem]:hidden text-white/80">
                              <div className="flex bg-[#0f0f12] py-[0.2rem]">
                                   <div className="flex justify-center h-full w-max p-[0.68rem] rounded-[2.4px] bg-[#00000070]">
                                        <img
                                             src={product.image}
                                             alt={product.title}
                                             className="w-[9.3rem] h-[9.3rem] object-cover transition-transform duration-300 ease-in-out inline-block hover:scale-[1.025] origin-center max-[38rem]:min-h-4 max-[38rem]:max-h-none"
                                        />
                                   </div>

                                   <div className="flex flex-col py-[0.4rem] px-[0.3rem] justify-around w-min box-content">
                                        <div className="flex justify-center flex-col items-center">
                                             <span className="text-[0.8rem] text-white/60 text-end w-full px-[0.2rem]">
                                                  $
                                             </span>
                                             <span className="bg-[#1c1c1c] text-[1.1rem]">
                                                  {product.price}
                                             </span>
                                        </div>

                                        <div className="flex justify-center flex-col items-center">
                                             <span className="text-[0.8rem] text-white/60 text-end w-full px-[0.6rem]">
                                                  unit
                                             </span>
                                             <span className="bg-[#1c1c1c] text-[1.1rem]">
                                                  {product.quantity}
                                             </span>
                                        </div>
                                   </div>
                              </div>

                              <div className="flex-1 pt-[0.2rem] bg-[#141414] rounded-[0.2rem] text-[#f0f8ff] w-full flex flex-col text-center items-center justify-center gap-[5%]">
                                   <div className="h-[3.375rem]">
                                        <h2 className="font-[Franklin_Gothic_Medium,Arial_Narrow,Arial,sans-serif] font-light text-[#e7e3eb] rounded-[3px] pt-[0.4rem] px-[0.5rem] pb-[0.5rem] text-[1.1rem]">
                                             {product.title}
                                        </h2>
                                   </div>

                                   <div className="py-[0.8rem] px-[0.7rem] items-center my-2 rounded flex self-center w-[92%] h-[1.2rem] gap-2 justify-between bg-[#0d0c0c]">
                                        <div
                                             itemProp="seller"
                                             itemScope
                                             itemType="http://schema.org/Organization"
                                             className="flex flex-row gap-4 pr-[4%] overflow-hidden justify-between w-full max-[38rem]:rounded-[5px] max-[38rem]:p-0 max-[38rem]:flex-col max-[38rem]:bg-[#201d20a8] max-[38rem]:py-2 max-[38rem]:h-full max-[38rem]:w-full"
                                        >
                                             <h3 className="text-[1.02rem] text-[#bfb6c6] max-[38rem]:text-[1.03rem]">
                                                  {product.seller_name}
                                             </h3>
                                             <h4 className="text-[1.02rem] text-[#bfb6c6] max-[38rem]:text-[1.03rem]">
                                                  {product.seller_rate}%
                                             </h4>
                                             <h4 className="text-[1.02rem] text-[#bfb6c6] max-[38rem]:text-[1.03rem]">
                                                  [{product.quantity}]
                                             </h4>
                                        </div>
                                   </div>
                              </div>
                         </div>

                         <div className="hidden max-[38rem]:contents">
                              <div className="flex w-full box-border justify-center gap-[0.9rem] items-center w-[95.9%] h-auto px-[0.4rem] py-[0.8rem] bg-[#181718a8] [grid-row:2] justify-self-end">
                                   <div
                                        itemProp="seller"
                                        itemScope
                                        itemType="http://schema.org/Organization"
                                        className="rounded-[5px] p-0 flex flex-col bg-[#201d20a8] justify-evenly py-2 h-full w-full"
                                   >
                                        <h3 className="text-left px-4 text-[1.02rem] text-center text-[#bfb6c6] max-[38rem]:text-[1.34rem]">
                                             {product.seller_name}
                                        </h3>

                                        <div className="flex flex-wrap justify-left items-center">
                                             <h4 className="px-4 text-left text-[1.02rem] text-[#bfb6c6] max-[38rem]:text-[1.5rem]">
                                                  {product.seller_rate}%
                                             </h4>
                                             <h4 className="text-left text-[1.02rem] text-[#bfb6c6] max-[38rem]:text-[1.45rem]">
                                                  [{product.quantity}]
                                             </h4>
                                        </div>

                                        <p className="px-4 text-left w-auto h-auto text-[1.7rem] box-border text-white/85 flex gap-[1rem]">
                                             $<span itemProp="price" content={product.price}>
                                                  {product.price}
                                             </span>
                                        </p>
                                   </div>

                                   <div className="w-[20vh] h-[20vh] aspect-square p-[0.4rem] bg-[#201d20a8] flex justify-center items-center">
                                        <img
                                             src={product.image}
                                             alt={product.title}
                                             className="w-full h-full aspect-square object-cover transition-transform duration-300 ease-in-out inline-block hover:scale-[1.025] origin-center"
                                        />
                                   </div>
                              </div>

                              <div className="flex justify-center items-center text-center p-2 bg-[#221f22a8] h-auto">
                                   <div className="w-full h-auto flex px-4 py-[0.4rem] rounded-[5px] justify-center items-center text-center bg-[#201d20a8]">
                                        <h2 className="text-[1.2rem] font-[Franklin_Gothic_Medium,Arial_Narrow,Arial,sans-serif] font-light text-[#e7e3eb]">
                                             {product.title}
                                        </h2>
                                   </div>
                              </div>
                         </div>
                    </a>
               </article>
          </div>
     </>
);

}