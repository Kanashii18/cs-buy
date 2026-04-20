import { useState } from "react";

export default function Product_config({setCategory, setMin, setMax, handleSubmit}) {

     const [max, actualMax] = useState(1000);
     const [min, actualMin] = useState(1);
     const inputW = () => "4ch";

     return (
          <section className="w-full h-full bg-[#040404] font-content">
               <div className="flex flex-col gap-6 p-4">
                    <section className="flex flex-col gap-4">
                         <div className="bg-[#0c0c0c] p-4 pb-6 pt-6 rounded">
                              <div className="flex flex-col gap-4 text-sm text-gray-300 underline font-[Verdana]">
                                   <h5 className="text-base text-white no-underline font-content text-[19px]">Categories</h5>
                                   <ul className="flex flex-col gap-2">
                                        <li>
                                             <input
                                                  type="radio"
                                                  id="accounts"
                                                  name="category"
                                                  className="hidden peer"
                                             />
                                             <label
                                                  htmlFor="accounts"
                                                  onClick={()=>{setCategory("account")}}
                                                  className="cursor-pointer peer-checked:text-[#c692e7] font-product"
                                             >
                                                  Accounts
                                             </label>
                                        </li>
                                        <li>
                                             <input
                                                  type="radio"
                                                  id="services"
                                                  name="category"
                                                  className="hidden peer"
                                             />
                                             <label
                                                  htmlFor="services"
                                                  onClick={()=>{setCategory("service")}}
                                                  className="cursor-pointer peer-checked:text-[#c692e7] font-product"
                                             >
                                                  Services
                                             </label>
                                        </li>
                                   </ul>
                              </div>
                         </div>
                    </section>

                    <section className="bg-[#0c0c0c] p-4 rounded">
                         <div className="flex flex-col gap-4">
                              <div className="flex justify-between text-white/90 text-sm gap-2">
                                   <span className="inline-flex items-center gap-1 whitespace-nowrap">
                                        Min
                                        <input
                                        type="number"
                                        value={min}
                                        onChange={(e) => {
                                             setMin(e.target.value)
                                             actualMin(e.target.value)
                                        }}
                                        style={{ width: inputW(min) }}
                                        className="bg-transparent outline-none text-right p-0 m-0 appearance-none text-[#9addb2]"
                                        />
                                        <span className="text-[#9addb2]">$</span>
                                   </span>
                                   <span className="inline-flex items-center gap-1 whitespace-nowrap">
                                        Max
                                        <input
                                        type="number"
                                        value={max <= 1000 ? max : 1000 }
                                        onChange={(e) => {
                                             setMax(e.target.value)
                                             actualMax(e.target.value)
                                        }}
                                        style={{ width: inputW(max) }}
                                        className="bg-transparent outline-none text-right p-0 m-0 appearance-none text-[#9addb2]"
                                        />
                                        <span className="text-[#9addb2]">$</span>
                                   </span>                             
                              </div>
               
                              <div className="relative w-full h-6">
                                   {/* Track */}
                                   <div className="absolute top-1/2 -translate-y-1/2 w-full h-1 bg-gray-300 rounded"></div>

                                   {/* Range activo */}
                                   <div
                                        className="absolute top-1/2 -translate-y-1/2 h-1 bg-[#ab5de5] rounded"
                                        style={{
                                             left: `${(min / 1000) * 100}%`,
                                             right: `${100 - (max / 1000) * 100}%`,
                                        }}
                                   ></div>

                                   {/* Min */}
                                   <input
                                        type="range"
                                        min="1"
                                        max="1000"
                                        value={min}
                                        onChange={(e) => {
                                             const value = Math.min(Number(e.target.value), max - 1)
                                             setMin(value)
                                             actualMin(value)
                                        }}
                                        className="absolute w-full pointer-events-none appearance-none bg-transparent cursor-pointer
                                        [&::-webkit-slider-thumb]:pointer-events-auto
                                        [&::-webkit-slider-thumb]:appearance-none
                                        [&::-webkit-slider-thumb]:h-4
                                        [&::-webkit-slider-thumb]:mt-[3px]
                                        [&::-webkit-slider-thumb]:w-4
                                        [&::-webkit-slider-thumb]:rounded-sm
                                        [&::-webkit-slider-thumb]:bg-[#ab5de5]"
                                        />

                                   {/* Max */}
                                   <input
                                        type="range"
                                        min="1"
                                        max="1000"
                                        value={max}
                                        onChange={(e) => {
                                             const value = Math.max(Number(e.target.value), min + 1)
                                             setMax(value)
                                             actualMax(value)
                                        }}
                                        className="absolute w-full pointer-events-none appearance-none bg-transparent cursor-pointer text-green
                                        [&::-webkit-slider-thumb]:pointer-events-auto
                                        [&::-webkit-slider-thumb]:appearance-none
                                        [&::-webkit-slider-thumb]:h-4
                                        [&::-webkit-slider-thumb]:w-4
                                        [&::-webkit-slider-thumb]:mt-[3px]
                                        [&::-webkit-slider-thumb]:rounded-sm
                                        [&::-webkit-slider-thumb]:bg-[#ab5de5]"
                                        />
                              </div>   
                         </div>
                    </section>
                    <div className="bg-[#0c0c0c] p-2 rounded cursor-pointer"
                         onClick={handleSubmit}>
                         <div className="flex justify-center items-center p-1 bg-[#342443] hover:bg-[#4c375f] transition duration-350">
                              <span className="text-white">Search</span>
                         </div>
                    </div>
               </div>
          </section>
     );
}
