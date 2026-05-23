import Errors from "./../errors/incorrect";
import EmailInput from "./../input/email-input";
import PasswordInput from "./../input/password-input";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const loaderSvg = "/assets/icons/loader/credential_loader.svg";

export default function LoginContainer() {
  const [error, setError] = useState(null);
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
     const params = useSearchParams();
     
     const return_to = params.get("return");
     console.log(return_to);
  const handleSubmit = async (e) => {
     e.preventDefault();
     setLoading(true);

     try {
          const res = await fetch("/api/user/login", {
               method: "POST",
               credentials: "include",
               headers: { "Content-Type": "application/json" },
               body: JSON.stringify({ username: email, password }),
          });

          const data = await res.json();
          if (!res.ok) return setError(data.message || "Login inválido");

          if (data.loggedIn) {
               const user = data.user;
               sessionStorage.setItem(
                    "session-cache",
                    JSON.stringify({
                         data: {
                              loggedIn: true,
                              user_id: user.id,
                              username: user.username,
                              img: user.img,
                         },
                    })
               );
               router.push(return_to || "/?section=global");
          } else {
               setError("No se pudo establecer sesión");
          }
     } catch {
          setError("Error desconocido, por favor reintentar");
     } finally {
          setLoading(false);
     }
     };

     return (
          <>
          <form
               onSubmit={handleSubmit}
               className="flex justify-center items-center w-full px-4"
          >
               {error && <Errors error={error}/>}

               <div className="max-sm:w-[90%] max-sm:mt-[1.5rem] flex flex-col items-center gap-7 sm:w-[50%] max-md:w-[60%] lg:w-[40%] xl:w-[30%] 2xl:w-[25%] bg-[#0e0d0d] rounded-xl max-sm:px-10 max-sm:py-10 px-16 py-16">
                    <EmailInput
                         id="login-email"
                         text= {email.length <= 0 ? "Username / Email" : ""}
                         value={email}
                         onChange={(e) => setEmail(e.target.value)}
                    />
                    <PasswordInput
                         id="login-password"
                         text={password.length <= 0 ? "Password" : ""}
                         value={password}
                         onChange={(e) => setPassword(e.target.value)}
                    />

                    {/* submit */}
                    <button
                         type="submit"
                         className="w-40 h-14 border-2 border-neutral-500 rounded-md flex items-center justify-center text-white hover:text-yellow-100 transition-colors"
                    >
                         {loading ? (
                              <img
                                   src={loaderSvg}
                                   alt="Loading"
                                   className="w-12 h-12 object-contain"
                              />
                         ) : (
                              "Sign In"
                         )}
                    </button>

                    {/* register */}
                    <p className="text-white text-sm text-center">
                    Aún no estás registrado?
                         <a
                              href={`/register${return_to ? `?return=${return_to}` : ""}`}
                              className="ml-1 text-purple-400 hover:underline"
                         >
                              Regístrate aquí!
                         </a>
                    </p>
               </div>
          </form>
          </>
     );
}
