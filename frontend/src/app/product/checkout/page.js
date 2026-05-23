"use client";

import { useState, useRef, useEffect } from 'react';
import { useRouter } from "next/navigation";
import { Suspense } from "react";

import Checkout from "../../components/checkout/content";
import Top_bar from "../../components/home/nav-bar/top_bar";
import Foot from "../../components/home/nav-bar/foot";
import { LoadingScreen } from "../../components/loader/main";

import useSession from "../../components/check_session";
import { handleLogout } from "../../scripts/logout";

export default function Checkout_content(){

     const router = useRouter();
     const ran = useRef(false);
     const [product, getProduct] = useState(false);
     const {loggedIn, user, loading} = useSession();
     
     useEffect(()=>{
          if(ran.current) return;
          ran.current = true;

          const sessionId = new URLSearchParams(window.location.search).get("session_id");
          if (!sessionId) return router.push("/");

          fetch(`/api/verify/checkout/product?session_id=${sessionId}`, {
               method: "GET",
               headers: { "Content-Type": "application/json" },
               credentials: "include"
          })
          .then(res => res.json())
          .then((data)=>{
               if(data.error === "Unauthorized") return router.push("/");
               return getProduct(data);
          })
     },[]);

     if(loading || !product) return <>
                                   <Top_bar handlelogout={handleLogout} loggedIn={loggedIn} user={loggedIn ? user : {}}/>
                                   <LoadingScreen/>
                                   {<Foot/> ? <Foot/> : <div>Loading...</div>}
                                   </>;
     return(
          <>
               <Top_bar handlelogout={handleLogout} loggedIn={loggedIn} user={loggedIn ? user : {}}/>
               <Checkout product={product} />
               {<Foot/> ? <Foot/> : <div>Loading...</div>}
               
          </>
     )
}