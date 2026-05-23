import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

function hasCookie(name) {
  return document.cookie
    .split("; ")
    .some((row) => row.startsWith(`${name}=`));
}

export default function useSession() {
  const [loggedIn, setLoggedIn] = useState(null);
  const [user, setUser] = useState({});
  const [loading, setLoading] = useState(true);
  const route = useRouter();
  const actual_url = usePathname();

  useEffect(() => {
    (async () => {
      const cookie = hasCookie("session_token");
      const cacheStr = sessionStorage.getItem("session-cache");
      const cached = cacheStr ? JSON.parse(cacheStr) : null;

      const isLoggedIn = cached?.data?.loggedIn === true;

      if (isLoggedIn) {
        setLoggedIn(true);
        setUser({
          id: cached.data.user_id,
          username: cached.data.username,
          img: cached.data.img,
        });
        return;
      } else if (!cached?.data?.loggedIn && cookie) {
        const res = await fetch("/api/auth/session-check", {
          credentials: "include",
          cache: "no-store",
        });

        if (!res.ok) {
          console.error("error checking session");
          return;
        }

        const data = await res.json();

        if (data.loggedIn) {
          sessionStorage.setItem(
            "session-cache",
            JSON.stringify({
              data: {
                loggedIn: data.loggedIn,
                user_id: data.id,
                username: data.username,
                img: data.img,
              },
            })
          );

          setLoggedIn(true);
          setUser({
            loggedIn: data.loggedIn,
            id: data.id,
            username: data.username,
            img: data.img,
            role: data.role,
          });
        } else {
          sessionStorage.setItem(
            "session-cache",
            JSON.stringify({
              data: {
                loggedIn: false,
              },
            })
          );
          setLoggedIn(false);
          setUser(null);
        }
      } else if (!cached?.data?.loggedIn && !cookie) {
        const urls_secure = [
          "/login",
          "/register",
          "/",
          "/help",
          "/product",
          "/dashboard/profile",
        ];

        if (!urls_secure.includes(actual_url)) {
          route.push("/login");
        }
      }
    })().finally(() => setLoading(false));
  }, [actual_url, route]);

  return { loggedIn, user, loading };
}