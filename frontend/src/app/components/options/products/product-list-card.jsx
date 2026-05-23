import { useState } from "react";

import { AlertDialog } from "../../../scripts/alertbox/alertbox.jsx";
import { openAlert } from "../../../scripts/alertbox/alertbox.js";

export default function Product_list_card({products, setproducts}){
     const [loadingId, setLoadingId] = useState(null);

     const handlePause = async (prod) => {
          setLoadingId(prod);

          // putting inmediatly in pause the product...
          
          setproducts(prev =>
               prev.map(p => (p.product_id === prod ? { ...p, active: 0 } : p))
          );

          try{ 
               const res = await fetch('/api/seller/pause', {
                    method: 'PUT',
                    headers: {
                         'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                    body: JSON.stringify({
                         product_id: prod
                    }),
               })
               if(!res.ok){
                    // put resume the product if there's a error...
                    setproducts(prev =>
                         prev.map(p => (p.product_id === prod ? { ...p, active: 1 } : p))
                    );
               }
          }catch(err){
               console.error('Error putting product in pause:', err);
               // put resume the product if there's a error...
               setproducts(prev =>
                    prev.map(p => (p.product_id === prod ? { ...p, active: 1 } : p))
               );
          }finally { setLoadingId(null); }
     }

     // is the same handlePause structure but opposite
     const handleResume = async (prod) => {
          setLoadingId(prod);
          // putting inmediatly in resume the product...
          setproducts(prev => {
               const next = prev.map(p => (p.product_id === prod ? { ...p, active: 1 } : p));
               return next;
          });

          try{
               const res = await fetch('/api/seller/resume', {
                    method: 'PUT',
                    headers: {
                         'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                    body: JSON.stringify({
                         product_id: prod
                    }),
               })
               if(!res.ok){
                    // put resume the product if there's a error...
                    setproducts(prev =>
                         prev.map(p => (p.product_id === prod ? { ...p, active: 0 } : p))
                    );
               }
          }catch(err){
               console.error('Error putting product in resume:', err);
               // put pause the product if there's a error...
               setproducts(prev =>
                    prev.map(p => (p.product_id === prod ? { ...p, active: 0 } : p))
               );

          }finally { setLoadingId(null); }  
     }
     const handleRemove = async (prod) => {

          const option = await openAlert("¿Are you sure you want to delete this product?", "DELETE", '#ff000087');
          if(!option) return;
          
          setLoadingId(prod);
          try{
               const res = await fetch('/api/seller/delete', {
                    method: 'DELETE',
                    headers: {
                         'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                    body: JSON.stringify({
                         product_id: prod
                    }),
               })   
               if(res.ok){
                    setproducts(prev => prev.filter(p => p.product_id !== prod));
               }
          }catch(err){
               console.error("Error deleting product: ",err);
          }finally { setLoadingId(null); }
     }
     return (
          <>
               {products.map((product) => (
                    <div
                         key={product.product_id}
                         className="flex flex-row bg-[#c17fff0d] p-4 w-max gap-8 min-w-[35rem] max-[32rem]:w-full max-[38rem]:w-full max-[38rem]:min-w-0"
                    >
                         <a href={`?e=${product.product_id}`} className="contents">
                              <div className="w-[2.7rem] h-[2.7rem] aspect-square border-[3px] border-[rgba(0,0,0,.404)] box-content">
                                   <img
                                        src={product.image}
                                        className="w-full h-full object-cover"
                                   />
                              </div>

                              <div className="flex w-full flex-col justify-between">
                                   <div className="flex items-end justify-between">
                                        <h3 className="text-white max-[32rem]:overflow-hidden max-[32rem]:text-ellipsis max-[32rem]:max-w-[40rem] max-[38rem]:whitespace-nowrap max-[38rem]:overflow-hidden max-[38rem]:text-ellipsis max-[38rem]:text-[.7rem] max-[38rem]:max-w-[7.1rem]">
                                             {product.title}
                                        </h3>
                                        <h4 className="text-[.92rem] text-[#fafafa8c] max-[52rem]:max-w-[27rem] max-[38rem]:whitespace-nowrap max-[38rem]:text-[.7rem]">
                                             Quantity {product.quantity}
                                        </h4>
                                   </div>

                                   <div className="flex gap-8 justify-between w-full max-[38rem]:gap-4">
                                        <h4 className="text-[.92rem] text-[#fafafa8c] max-[38rem]:whitespace-nowrap max-[38rem]:text-[.757rem]">
                                             {product.created_at
                                                  .replace('T', ' ')
                                                  .replace('.000Z', '')}
                                        </h4>
                                        <h4 className="text-[.92rem] text-[#fafafa8c] max-[38rem]:whitespace-nowrap max-[38rem]:text-[.757rem]">
                                             $ {product.price}
                                        </h4>
                                   </div>
                              </div>
                         </a>

                         <div className="flex flex-col justify-between">
                              {loadingId === product.product_id ? (
                                   <>
                                        <div className="w-[1.25rem] h-[1.25rem] cursor-pointer">
                                             {product.active === 1 ? (
                                                  <img
                                                       className="w-[1.25rem] h-[1.25rem] bg-[#77ff494f] rounded-[4px]"
                                                       src="../assets/icons/options/pause.svg"
                                                       alt="pause or resume product"
                                                  />
                                             ) : (
                                                  <img
                                                       className="w-[1.25rem] h-[1.25rem] bg-[#4525fa] rounded-[4px]"
                                                       src="../assets/icons/options/resume.svg"
                                                       alt="pause or resume product"
                                                  />
                                             )}
                                        </div>
                                        <div className="w-[1.25rem] h-[1.25rem] cursor-pointer">
                                             <img
                                                  className="w-5 h-5 transition-[background-color] duration-200 ease-in-out hover:rounded-[3px] hover:bg-red-500"
                                                  src="../assets/icons/options/delete.svg"
                                                  alt="delete product"
                                             />
                                        </div>
                                   </>
                              ) : (
                                   <>
                                        <div 
                                             onClick={() =>
                                                  product.active === 1
                                                       ? handlePause(product.product_id)
                                                       : handleResume(product.product_id)
                                             }
                                             className="w-[1.25rem] h-[1.25rem] cursor-pointer"
                                        >
                                             {product.active === 1 ? (
                                                  <img
                                                       className="w-[1.25rem] h-[1.25rem] bg-[#77ff494f] rounded-[4px]"
                                                       src="../assets/icons/options/pause.svg"
                                                       alt="pause or resume product"
                                                  />
                                             ) : (
                                                  <img
                                                       className="w-[1.25rem] h-[1.25rem] bg-[#4525fa] rounded-[4px]"
                                                       src="../assets/icons/options/resume.svg"
                                                       alt="pause or resume product"
                                                  />
                                             )}
                                        </div>
                                        <div
                                             onClick={() => handleRemove(product.product_id)}
                                             className="cursor-pointer"
                                        >
                                             <img
                                                  className="w-5 h-5 transition-[background-color] duration-200 ease-in-out hover:rounded-[3px] hover:bg-red-500"
                                                  src="../assets/icons/options/delete.svg"
                                                  alt="delete product"
                                             />
                                        </div>
                                   </>
                              )}
                         </div>
                    </div>
               ))}
               <AlertDialog />
          </>
     );
}