export default function Banner() {
     return (
          <div className="flex w-full justify-center items-center mt-[3.6%] max-sm:mt-[18%]">
               <div className="w-full bg-black overflow-hidden">
                    <div className="relative flex items-center justify-center w-full min-h-[33vh] bg-black text-white">
                         {/* NUBES */}
                         <div className="absolute inset-0 flex items-center justify-center blur-[2.8px] opacity-20 pointer-events-none translate-y-[10px]">
                              <div className="flex flex-col">
                                   <div className="flex gap-[10px] animate-[floatClouds_18s_ease-in-out_infinite]">
                                        {Array.from({ length: 8 }).map((_, i) => (
                                        <div key={i} className="w-[250px] h-[250px] rounded-full bg-[rgb(89,44,160)]" />
                                        ))}
                                   </div>

                                   <div className="flex gap-[10px] -mt-[190px] -ml-[100px] animate-[floatClouds_22s_ease-in-out_infinite]">
                                        {Array.from({ length: 8 }).map((_, i) => (
                                        <div key={i} className="w-[250px] h-[250px] rounded-full bg-[rgb(103,52,184)]" />
                                        ))}
                                   </div>

                                   <div className="flex gap-[10px] -mt-[190px] animate-[floatClouds_24s_ease-in-out_infinite]">
                                        {Array.from({ length: 8 }).map((_, i) => (
                                        <div key={i} className="w-[250px] h-[250px] rounded-full bg-[rgb(112,59,197)]" />
                                        ))}
                                   </div>

                                   <div className="flex gap-[10px] -mt-[190px] -ml-[100px] animate-[floatClouds_26s_ease-in-out_infinite]">
                                        {Array.from({ length: 8 }).map((_, i) => (
                                        <div key={i} className="w-[250px] h-[250px] rounded-full bg-[rgb(116,66,196)]" />
                                        ))}
                                   </div>

                                   <div className="flex gap-[10px] -mt-[190px] animate-[floatClouds_28s_ease-in-out_infinite]">
                                        {Array.from({ length: 8 }).map((_, i) => (
                                        <div key={i} className="w-[250px] h-[250px] rounded-full bg-[rgb(133,78,221)]" />
                                        ))}
                                   </div>

                                   <div className="flex gap-[10px] -mt-[190px] -ml-[100px] animate-[floatClouds_25s_ease-in-out_infinite]">
                                        {Array.from({ length: 8 }).map((_, i) => (
                                        <div key={i} className="w-[250px] h-[250px] rounded-full bg-[rgb(145,90,233)]" />
                                        ))}
                                   </div>

                                   <div className="flex gap-[10px] -mt-[190px] animate-[floatClouds_30s_ease-in-out_infinite]">
                                        {Array.from({ length: 8 }).map((_, i) => (
                                        <div
                                             key={i}
                                             className="w-[250px] h-[250px] rounded-full bg-[rgb(162,105,255)]"
                                        />
                                        ))}
                                   </div>
                              </div>
                         </div>

                         {/* TEXTO */}
                    <div className="relative z-10  text-[clamp(7.5rem,12vw,8.4rem)] max-sm:text-[clamp(4.5rem,12vw,8.4rem)]  font-bold text-[#9c76cd] whitespace-nowrap font-content">
                              CS-BuY
                         </div>

                         <style jsx global>{`
                              @keyframes floatClouds {
                              0% { transform: translate(0, 0); }
                              25% { transform: translate(40px, -10px); }
                              50% { transform: translate(80px, 10px); }
                              75% { transform: translate(40px, -5px); }
                              100% { transform: translate(0, 0); }
                              }
                         `}</style>

                    </div>
               </div>
          </div>
     );
}
