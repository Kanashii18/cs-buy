"use client";

import Go_home from "../components/verify/go_home";
import { LoadingScreen } from "../components/loader/main";

import useSession from "../components/check_session";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Register_Container from "./../components/verify/register/container";
//import Foot from "../../components/home/nav-bar/foot";
import Foot from "../components/home/nav-bar/foot";

export default function Register(){
     
     const {loggedIn, user, loading} = useSession();
     const router = useRouter(); 
     // if user alright have session we redirect to home...
     useEffect(() => {
          if (loggedIn === true) {
               router.push("/?section=global");
          }
     }, [loggedIn]);

     if (loading) {
               return <div className="w-full h-screen max-sm:h-max overflow-hidden bg-[#1a1a2e] flex flex-col justify-center">
                         <Go_home/>
                         <main className="w-screen h-screen max-sm:h-max overflow-hidden grid grid-rows-[1.2fr_0.05fr]">
                              <LoadingScreen />
                         </main>
                         {<Foot/> ? <Foot/> : <div>Loading...</div>}
                    </div>
          }
 
     return (
          <>   
               <div className="w-full h-screen max-sm:h-max overflow-hidden bg-[#1a1a2e] flex flex-col justify-center h-auto">
                    <Go_home/>
                    <main className="w-screen h-screen max-sm:h-max overflow-hidden grid grid-rows-[1.2fr_0.05fr]">
                         <Register_Container />
                    </main>
                    <Foot/>   
               </div>
          </>
     )
}