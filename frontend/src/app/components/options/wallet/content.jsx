import { useState, useEffect } from "react";
import History_card from "./history-card";
import Ahc_method from "./ahc";

export default function Wallet({LoadingScene}){
     const [loading, setloadings] = useState(true);
     const [balance,setbalance] = useState("");
     const [pending,setpending] = useState("");
     const [viewoptions, setview] = useState(false);

     const withdraw_balance = () => {
          if(viewoptions) setview(false)
          else if(!viewoptions) setview(true);
     }

     useEffect(()=>{
          (async()=>{
               const res = await fetch('/api/account/count',{
                    credentials:"include",
               })
               if(!res.ok) return console.error("Error getting account count");
               const data = await res.json();

               setbalance(data.available);
                    setpending(data.pending);
          })()
               .finally(()=>setloadings(false));
     },[]);

     if(loading) return <LoadingScene/>;

     return(
          <>
               <div className="text-suboption wallet-content bg-[#131016] w-full h-full flex gap-[5.5rem] p-4 justify-center items-start max-[32.0625rem]:flex-col max-[32.0625rem]:p-0 max-[27.5rem]:p-4 max-[27.5rem]:gap-[.8rem]">

                    <div className="wallet-info w-full max-w-[22rem] h-min gap-8 flex items-center flex-col rounded-md mt-[6rem] max-[65.0625rem]:p-[1rem_0] max-[65.0625rem]:h-[70%] max-[27.5rem]:pt-[2.1rem]">
                         <div className="wallet-balance bg-[rgb(30,25,36)] w-[90%] h-[60%] flex items-start flex-col max-[65.0625rem]:pt-4">
                              <div className="wallet-text flex absolute">
                                   <h3 id="balance-text" className="underline text-[1.3rem] p-4 max-[65.0625rem]:text-[.9rem] max-[32.0625rem]:text-[.8rem]">
                                        Balance
                                   </h3>
                              </div>
                              <div className="wallet-balance-value bg-[#c371f53d] w-full h-full flex justify-center items-center rounded-md py-[3.7rem] max-[65.0625rem]:p-16 max-[32.0625rem]:py-16">

                                   <h3 className="text-[2.7rem] font-['Roboto'] text-[#ffe9feba]">
                                        {balance} usd
                                   </h3>

                              </div>

                         </div>
                         <div className="wallet-options flex gap-32 px-4 max-[70rem]:gap-8 max-[70rem]:px-4 max-[65.0625rem]:gap-12 max-[32.0625rem]:gap-[2.8rem]">

                              <div className="withdraw-option set-wallet-optiion cursor-pointer bg-[#daa2ff2e] p-[1rem_2.1rem] rounded-md transition-colors duration-300 ease-in-out hover:bg-[#daa2ff45]" onClick={withdraw_balance}>
                                   <div className="withdraw-content">
                                        <span id="withdraw-buttom" className="text-[1.2rem] min-w-[6rem] justify-center flex">
                                             Withdraw
                                        </span>
                                   </div>
                              </div>

                         </div>
                         <div className="wallet-methods w-min bg-[#e3fff60a] overflow-auto transition-[max-height] duration-500 ease-in-out rounded max-h-0 flex flex-col gap-2"
                              style={viewoptions ? { maxHeight: '300px' } : {}}>
                              <Ahc_method/>
                         </div>

                    </div>
                    <div className="wallet-info w-full max-w-[22rem] h-min gap-8 flex items-center flex-col rounded-md mt-[6rem] max-[65.0625rem]:p-[1rem_0] max-[65.0625rem]:h-[70%]">
                         <div className="wallet-balance bg-[rgb(30,25,36)] w-[90%] h-[60%] flex items-start flex-col max-[65.0625rem]:pt-4">
                              <div className="wallet-text flex absolute">
                                   <h3 id="balance-text" className="underline text-[1.3rem] p-4 max-[65.0625rem]:text-[.9rem] max-[32.0625rem]:text-[.8rem]">
                                        Pending
                                   </h3>
                              </div>
                              <div className="wallet-balance-value bg-[#c371f53d] w-full h-full flex justify-center items-center rounded-md py-[3.7rem] max-[65.0625rem]:p-16 max-[32.0625rem]:py-16">
                                   <h3 className="text-[2.7rem] font-['Roboto'] text-[#ffe9feba]">
                                        {pending} usd
                                   </h3>
                              </div>
                         </div>
                    </div>
                    <div className="wallet-history flex items-center flex-col h-full max-h-full p-6 gap-6 w-max max-[32.0625rem]:w-full max-[27.5rem]:p-2 max-[27.5rem]:gap-2">

                         <div className="wallet-history-text font-['Roboto'] font-medium text-[1.2rem]">
                              Recent Transitions
                         </div>
                         <div className="wallet-history-content bg-[#c371f53d] w-full h-full flex justify-start flex-col overflow-scroll gap-[1.1rem] p-[2.7rem_1rem_1rem_1rem] rounded-md [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden max-[65.0625rem]:p-[2rem_.9rem] max-[32.0625rem]:p-[2rem_.9rem]">

                              <History_card/>
                              <History_card/>

                         </div>
                    </div>
               </div>
          </>
     )
}