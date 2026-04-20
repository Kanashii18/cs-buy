export default function Details({product}){

     return (
          <div className="flex justify-center items-start flex-col bg-white/5 py-4 px-4 gap-[3.2rem] text-[#f3f3f3f5]">
               <div className="bg-[rgb(25,23,26)] p-[.4rem] w-full flex-col">
                    <div className="gap-[5rem] py-[.1rem] px-[.4rem] flex bg-[rgb(82,43,117)] items-center justify-around">
                         <div>
                              <p
                                   className="truncate max-w-[13rem]"
                                   style={{
                                        textOverflow: "ellipsis",
                                        overflow: "hidden",
                                        whiteSpace: "nowrap",
                                        maxWidth: "13rem",
                                   }}
                              >
                                   {product.title}
                              </p>
                         </div>

                         <div className="flex flex-col whitespace-nowrap" style={{ wordSpacing: "3.6px", fontFamily: "auto" }}>
                              <h5>Warranty | 7 day</h5>
                              <h5>Delivery | {product.deliveryUnit}</h5>
                         </div>
                    </div>
               </div>

               <div className="flex gap-6 w-full justify-between">
                    <div className="w-full">
                         <div className="p-[.4rem] min-w-[18rem] flex flex-col h-full justify-between">
                              <div className="text-center py-[.4rem] px-4 w-full flex flex-col gap-6">
                                   <div className="flex justify-around">
                                        <h4 className="whitespace-nowrap text-[#f3f3f3f5]">Order Price:</h4>
                                        <h4 className="whitespace-nowrap text-[#f3f3f3f5]">{product.price} $</h4>
                                   </div>
                              </div>

                              <div className="flex justify-around text-[1.09rem]">
                                   <h3>Total:</h3>
                                   <h3>{product.price} $</h3>
                              </div>
                         </div>
                    </div>

                    <div className="flex flex-col justify-center items-center gap-[3.1rem]">
                         <div className="min-w-[11rem] min-h-[11rem] max-w-[11rem] max-h-[11rem] overflow-hidden p-[.3rem] bg-[rgb(43,58,58)]">
                              <img src={product.image} alt="product image" srcSet="" className="w-full h-full object-cover block" />
                         </div>
                    </div>
               </div>
          </div>
     );
}