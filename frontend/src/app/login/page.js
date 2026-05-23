"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LoadingScreen } from "../components/loader/main";

import Go_home from "../components/verify/go_home";
import Container from "../components/verify/login/container";
import useSession from "../components/check_session";
// import AnimatedBackground from "../components/home/menu/background";
import Foot from "../components/home/nav-bar/foot";
 

export default function Login(){

     const {loggedIn, user, loading} = useSession();
     const router = useRouter();
     // if user alright have session we redirect to home...
     useEffect(() => {
          if (loggedIn === true) {
               router.push("/?section=global");
          }
     }, [loggedIn]);

     if (loading) {
          return <div className="w-full h-screen overflow-hidden bg-[#1a1a2e] flex flex-col justify-center h-[100vh]">
                    <Go_home/>
                    <main className="w-screen h-screen overflow-hidden grid grid-rows-[1.2fr_0.05fr]">
                         <LoadingScreen />
                    </main>
                    {<Foot/> ? <Foot/> : <div>Loading...</div>}
               </div>
     }

     return (
          <>
               {/* <AnimatedBackground> */}
               <div className="w-full h-screen overflow-hidden bg-[#1a1a2e] flex flex-col justify-center h-[100vh]">
                    <Go_home/>
                    <main className="w-screen h-screen overflow-hidden grid grid-rows-[1.2fr_0.05fr]">
                         <Container />
                    </main>

                    <Foot className/>
               </div>
               {/* </AnimatedBackground> */}
          </>
     )
}