import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";

/**
 * Session Hook
 */
export default function useSession() {
	// read cache in memory 

	const [loggedIn, setLoggedIn] = useState(null);
	const [user, setUser] = useState({});
	const [loading, setLoading] = useState(true);
	const route = useRouter();
	const actual_url = usePathname();

    	useEffect(() => {
	    	(async()=>{
			let cookie = await cookieStore.get('session_token');
			cookie = cookie?.value ?? false;
			const cacheStr = sessionStorage.getItem("session-cache");
			const cached = cacheStr ? JSON.parse(cacheStr) : null;

			const isLoggedIn = cached?.data?.loggedIn === true ?? false;
			if (isLoggedIn) {
				setLoggedIn(true);
				setUser({
					id: cached.data.user_id,
					username: cached.data.username,
					img: cached.data.img
				});
				setLoading(false);
				return;	
			}
			else if (!cached?.data?.loggedIn && cookie){
				// We check if we find the session_token cookie; if so, we make the request to the API to obtain the desired information.
				// NOTA : Debemos cargar la informacion acerca del usuario desde el cache
				// Si no hay cache o el cache está expirado, haz el session-check
				const res = await fetch("/api/auth/session-check", { credentials: "include", cache: "no-store" })
				if(!res.ok) return console.error("error checking session");
				const data = await res.json();
				if (data.loggedIn) {
					sessionStorage.setItem("session-cache", JSON.stringify({
						data: {
							loggedIn: data.loggedIn,
							user_id: data.id,
							username: data.username,
							img: data.img
						}
					}));

					setLoggedIn(true);
					setUser({
						loggedIn: data.loggedIn,
						id: data.id,
						username: data.username,
						img: data.img,
						role: data.role
					});
				} else {
					if(!data.loggedIn) sessionStorage.setItem("session-cache",JSON.stringify({
						data: {
							loggedIn: false
						}
					}));
					setLoggedIn(false);
					setUser(null);
				}
			}
			else if (!cached?.data?.loggedIn && !cookie){
				const urls_secure = [
					"/login",
					"/register",
					"/",
					"/help",
					"/product",
					"/dashboard/profile"
				]
				if (!urls_secure.includes(actual_url)) {
					route.push("/login");
				}
			}
		})()	.finally(() => setLoading(false))
    }, []);

    // Return loggedIn : Json, user : Json with user information OR Null
    return { loggedIn, user, loading };
}
