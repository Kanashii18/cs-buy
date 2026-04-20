"use client";
import { useRouter } from "next/navigation";
import useSession from "./../components/check_session";
import { useEffect  } from "react";

export default function Profile(){

     // ===============|| Look for the info user ||================ //
     const redirect = useRouter();
     const {loggedIn, user, loading} = useSession();

     useEffect(() => {
          if (loggedIn === false) {
                    redirect.push("/login");
                    return
               }
          }, [loggedIn]);
          
     useEffect(() => {
          if (user && user.id && window.location.pathname === "/dashboard") {
               redirect.push(`/dashboard/profile?id=${user.id}`);
          }
     }, [user]);
}