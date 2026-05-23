'use client'

import useSession from "../components/check_session";

import Focus_container from "../components/product-checkout/container"
import Top_bar from "../components/home/nav-bar/top_bar";
import Foot from "../components/home/nav-bar/foot";

// Styles
import { handleLogout } from "../scripts/logout";

export default function Product(){

     // ===============|| Look for the info user ||================ //

     const {loggedIn, user, loading} = useSession();

     return (
          <>   
          <Top_bar handlelogout={handleLogout} loading={loading} loggedIn={loggedIn} user={loggedIn ? user : {}}/>
                    <main className="flex flex-col items-center gap-2 w-full h-min box-border border-0 mb-16">
                         <Focus_container loading={loading}/>
                    </main>
               <Foot/>
          </>
     )
}

// <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black/60 transition-all duration-300 ease-in-out z-[9998]">
//      <div className="relative w-16 h-16 text-[var(--brand-yellow-1)] text-[0]">
//           <div className="absolute top-[5%] left-1/2 w-4 h-4 -mt-2 -ml-2 rounded-full bg-purple-300 animate-[ball-spin-clockwise_1.6s_infinite_cubic-bezier(0.5,0,0.5,1)] [animation-delay:-1.4s]" />
//           <div className="absolute top-[18%] left-[82%] w-4 h-4 -mt-2 -ml-2 rounded-full bg-purple-300 animate-[ball-spin-clockwise_1.6s_infinite_cubic-bezier(0.5,0,0.5,1)] [animation-delay:-1.2s]" />
//           <div className="absolute top-1/2 left-[95%] w-4 h-4 -mt-2 -ml-2 rounded-full bg-purple-300 animate-[ball-spin-clockwise_1.6s_infinite_cubic-bezier(0.5,0,0.5,1)] [animation-delay:-1s]" />
//           <div className="absolute top-[82%] left-[82%] w-4 h-4 -mt-2 -ml-2 rounded-full bg-purple-300 animate-[ball-spin-clockwise_1.6s_infinite_cubic-bezier(0.5,0,0.5,1)] [animation-delay:-.8s]" />
//           <div className="absolute top-[95%] left-1/2 w-4 h-4 -mt-2 -ml-2 rounded-full bg-purple-300 animate-[ball-spin-clockwise_1.6s_infinite_cubic-bezier(0.5,0,0.5,1)] [animation-delay:-.6s]" />
//           <div className="absolute top-[82%] left-[18%] w-4 h-4 -mt-2 -ml-2 rounded-full bg-purple-300 animate-[ball-spin-clockwise_1.6s_infinite_cubic-bezier(0.5,0,0.5,1)] [animation-delay:-.4s]" />
//           <div className="absolute top-1/2 left-[5%] w-4 h-4 -mt-2 -ml-2 rounded-full bg-purple-300 animate-[ball-spin-clockwise_1.6s_infinite_cubic-bezier(0.5,0,0.5,1)] [animation-delay:-.2s]" />
//           <div className="absolute top-[18%] left-[18%] w-4 h-4 -mt-2 -ml-2 rounded-full bg-purple-300 animate-[ball-spin-clockwise_1.6s_infinite_cubic-bezier(0.5,0,0.5,1)]" />
//      </div>
// </div>