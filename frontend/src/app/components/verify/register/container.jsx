import Errors from "./../errors/incorrect";
import Email_input from "../input/email-input";
import Password_input from "../input/password-input";
import Terms from "./terms";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
const loaderSvg = "../assets/icons/loader/credential_loader.svg";

export default function Container_Main(){
     const [email, setEmail] = useState("");
     const [password, setPassword] = useState("");
     const [confirmPassword, setConfirm] = useState("");
     const [error, setError] = useState(null);
     const [termsneed, setTermsneed] = useState(true);
     const [loading, setLoading] = useState(false);
     const router = useRouter();
     const params = useSearchParams();

     const return_to = params.get("return");
     console.log(return_to);

     // ========================= || Call Api to Register || ========================= //

     // guarda sesión en caché tras registrarse (igual que login)
     const handleSubmit = async (e) => {
          e.preventDefault();
          setLoading(true);
          setError(null);
          if (password !== confirmPassword) {
               setLoading(false);
               return setError("Las contraseñas no coinciden");
          }

          try {
               const res = await fetch("/api/user/register", {
                    method: "POST",
                    credentials: "include",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, password }),
               });

               const data = await res.json();
               if (!res.ok) {
                    return setError(data.error || "Registro inválido");
               }

               // normalizar session

               const payload = {
                    ts: Date.now(),
                    data: {
                         loggedIn: data.loggedIn,
                         user_id: data.user_id,
                         username: data.username,
                         img: data.img,
                         role: data.role
                    }
               };

               sessionStorage.setItem("session-cache", JSON.stringify(payload));
               router.push(return_to || "/?section=global");
               return;

          } catch (err) {
               console.error("Register error:", err);
               setError("Error desconocido. Por favor reintentar.");
          } finally {
               setLoading(false);
          }
     };

     // ============================================================= //

     return (
          <form
          onSubmit={handleSubmit}
          className="flex justify-center items-center w-full px-4"
          >
               <div className="
                    max-sm:w-[90%]
                    max-sm:mt-[1.5rem]
                    flex flex-col items-center gap-7
                    sm:w-[50%]
                    max-md:w-[60%]
                    lg:w-[40%]
                    xl:w-[30%]
                    2xl:w-[25%]
                    bg-[#0e0d0d]
                    rounded-xl
                    max-sm:px-10 max-sm:py-10
                    px-16 py-16
               ">
                    {error && <Errors error={error} display="block" />}

                    <Email_input
                         id="register-email-input"
                         text={email.length <= 0 ? "Email" : ""}
                         value={email}
                         mode="email"
                         onChange={(e) => setEmail(e.target.value)}
                    />

                    <Password_input
                         id="register-password-input"
                         text={password.length <= 0 ? "Password" : ""}
                         value={password}
                         onChange={(e) => setPassword(e.target.value)}
                    />

                    <Password_input
                         id="confirm-password-input"
                         text= {confirmPassword.length <= 0 ? "Confirm Password" : ""}
                         value={confirmPassword}
                         onChange={(e) => setConfirm(e.target.value)}
                    />

                    <Terms TermsAndConditions={setTermsneed} />

                    {/* submit */}
                    <button
                    type="submit"
                    className="w-40 h-14 border-2 border-neutral-500 rounded-md flex items-center justify-center text-white hover:text-yellow-100 transition-colors cursor-pointer"
                    disabled={termsneed}
                    >
                         {loading ? (
                              <img
                              src={loaderSvg}
                              alt="Loading"
                              className="w-12 h-12 object-contain"
                              />
                         ) : (
                              "Sign Up"
                         )}
                    </button>

                    {/* login */}
                    <p className="text-white text-sm text-center whitespace-nowrap">
                    ¿Ya tienes cuenta?
                         <a
                              href={`/login${return_to ? `?return=${return_to}` : ""}`}
                              className="ml-1 text-purple-400 hover:underline"
                         >
                              Inicia sesión aquí!
                         </a>
                    </p>
               </div>
          </form>
     );
}


