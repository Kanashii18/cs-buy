import SellerCard from "./seller-card/seller_info_card";
import Details_card from "./seller-card/seller_details_card";
import { useState } from "react";
import { useRouter } from "next/navigation";
const loaderSvg = "../assets/icons/loader/payment_loader.svg";

export default function Purchase_Container({product,seller, Loadingdiv}){
     const [loading,setLoading] = useState(false);
     const router = useRouter();
     const [error, setError] = useState(null);

     const handleCheckout = async() => {
          if(!product.product_id) return;
          setLoading(true);
          setError(null);

          const res = await fetch(`/api/verify/checkout/token`, {
               method: "POST",
               headers: { "Content-Type": "application/json" },
               credentials: "include",
               body: JSON.stringify({ product_id: product.product_id })
          })
          const data = await res.json();
          if(data.error === "Unauthorized") return router.push("/login");
          router.push(`/product/checkout?session_id=${data.session_id}`);
          setLoading(false);

     };
          
     return(
          <>
               <div className="flex h-full">
                    <div className="w-full h-full flex flex-col justify-center items-center gap-12">
                         <div className="mt-[2.8%] h-12 w-4/5 rounded-[0.23rem] bg-[hsl(0_0%_7%)] flex items-center" id="seller-buy-content">
                              <SellerCard seller={seller} Loadingdiv={Loadingdiv} />
                         </div>

                         <section className="flex justify-center items-center h-min w-full">
                              <Details_card product={product} Loadingdiv={Loadingdiv}/>
                         </section>

                         <div className="w-full bg-[rgb(12_12_12)] flex justify-center items-center">
                              <button
                                   onClick={handleCheckout}
                                   id="purchase-product-buttom"
                                   type="submit"
                                   className="px-20 whitespace-nowrap h-[3.3rem] rounded-[5px] text-white bg-[#121212] border-2 border-[#578726] cursor-pointer bg-[linear-gradient(to_right,_#12401117_50%,_#121212_50%)] bg-[length:200%_100%] bg-right-bottom transition-[background-position] duration-[400ms] ease-[ease] hover:bg-left-bottom"
                              >
                                   {loading ? (
                                        <img
                                             src={loaderSvg}
                                             alt="Loading"
                                             className="w-[3.2rem] h-[3.2rem] object-contain"
                                        />
                                   ) : (
                                        <span className="text-[rgb(247_247_247)] text-[1.34rem] font-serif">
                                             {product.price}$ | Buy
                                        </span>
                                   )}
                              </button>
                         </div>
                    </div>
               </div>
          </>
     )
}