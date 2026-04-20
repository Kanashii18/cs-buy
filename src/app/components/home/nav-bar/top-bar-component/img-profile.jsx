import { usePathname } from "next/navigation";

export default function img_profile({user, count_messages, count_notifications, loading}){
     const size_icons = "w-[1.83rem] h-[1.83rem]"
     const profile_icon = "w-[2.28rem] h-[2.28rem]"
     const pathroute = usePathname();
     console.log(user.img, loading);
     return (
          <>
               <div id="profile-nav-option" className="flex h-[100%] w-[2rem]">
                    <div>
                         <a href={`/dashboard/profile?id=${user.id}`} id="profile-img" className={`flex ${profile_icon} overflow-hidden items-center justify-center text-[#331941] font-[math] font-semibold tracking-[1.4px] bg-[#2f183b] rounded-[50%] no-underline p-0`}>
                              {user.img && !loading ? 
                              <img id="profile-img-value" className="w-full h-full p-[1.5px] object-cover block rounded-full" src={user.img} decoding="async" fetchPriority="high" alt="Profile" />
                              :
                              <div className="w-full h-full p-[1.5px] object-cover block rounded-full bg-black/5" fetchPriority="high" alt="Profile" />
                              }
                         </a>
                    </div>
               </div>
               {/* messages */}
               <div>
                    <div className="flex">
                         <a href="/dashboard/message" className={`inline-block relative ${size_icons}`}>
                              {count_messages <= 0 || pathroute === "/dashboard/message" ? (
                                   <></>
                              ) : (
                                   <span className="absolute font-normal font-[Roboto] text-[1.2rem] rounded-[7px] text-white px-[.28rem] bg-[#865799] left-[76%] top-[-48%]">
                                        {count_messages}
                                   </span>
                              )}
                              <img className="w-full h-full" src="../assets/icons/nav/message.svg" alt="Messages" />
                         </a>
                    </div>
               </div>
               {/* notications */}
               <div>
                    <div className="flex">
                         <a href="/dashboard/notifications" className={`relative inline-flex items-center justify-center ${size_icons}`}>
                              {count_notifications <= 0 ? (
                                   <></>
                              ) : (
                                   <span className="absolute font-normal font-[Roboto] text-[1.2rem] rounded-[7px] text-white px-[.28rem] bg-[#865799] left-[61%] top-[-30.2%]">
                                        {count_notifications}
                                   </span>
                              )}
                              <img className="w-full h-full" src="../assets/icons/nav/notification.svg" alt="Notifications" />
                         </a>
                    </div>
               </div>
               {/* wallet */}
               <div>
                    <div className="flex">
                         <a href="/dashboard/wallet" className={`inline-block relative ${size_icons}`}>
                              <img className="w-full h-full" src="../assets/icons/nav/wallet.svg" alt="Wallet" />
                         </a>
                    </div>
               </div>
          </>
     )
}