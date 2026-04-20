export async function handleLogout(redirect) {
     // redirect : next/navigation hook
     // const redirect = router();
     const res = await fetch("/api/auth/logout", {
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
