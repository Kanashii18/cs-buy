export async function handleLogout(redirect) {
     // remove actual checkout cookie session
     const res = await fetch("http://127.0.0.1:4038/api/auth/logout", {
          credentials: "include",
          method: "POST",
          headers: { "Cache-Control": "no-cache" }
     });

     if (res.ok) {
          sessionStorage.clear();
          localStorage.clear();
          redirect.push("/login");
     } else {
          console.error("Error:", await res.text());
     }
}
