import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import LoadingText from "../../scripts/loadingText";
import Loadingdiv from "../../scripts/loadingdiv";

export default function Container_options({ user, LoadingScene }) {
     const navigate = useRouter();
     const [user_information, setInformation] = useState({
          "accounts_selled":<LoadingText text={""} />,
          "services_selled":<LoadingText text={""} />,
          "description":<LoadingText text={""} />,
          "username":<LoadingText text={""} />
     });

     useEffect(() => {
          (async()=>{
               const cacheStr = sessionStorage.getItem("session-cache");
               const cache = cacheStr ? JSON.parse(cacheStr) : null;

               const id_param = new URLSearchParams(window.location.search);
               let userID;
               let id = id_param.get("id");
               if(!id) id = cache?.data?.user_id;
               if(!id) return;
               
               if (!id || id === "undefined" || id === "") {
                    console.log("la weba mmg", user.id);
                    if (user?.id) {
                         userID = user.id;
                         navigate.push(`/dashboard/profile?id=${user.id}`);
                    }else return navigate.push(`/?section=global`);
               }else userID = id;
               
               const res = await fetch(`/api/auth/profile?id=${userID}`, {
               credentials: "include",
               method: "GET",
               });
               const data = await res.json();
               console.log(data);
               setInformation(data);
          })()
     }, [user, navigate.push]);

     // if (loading_profile) return <LoadingScene />;

     return (
          <>
               <div className="pt-1 flex justify-center items-center h-60 w-[95%] bg-[#131016]">
                    <div id="banner-profile" className="flex flex-col items-center w-[99%] h-full bg-[#131016]">
                         <div
                              className="div-layer-user w-full max-h-60 bg-black px-[0.2rem] py-[0.4rem] flex justify-center flex-col items-center"
                              id="layer-banner"
                         >
                              <div
                              className="profile-banner relative w-full h-[220px] bg-cover bg-center flex justify-center items-end"
                              style={{ backgroundImage: 'url("../data/images/banner/1.jpg")' }}
                              >
                                   <div
                                        className="div-layer-user bg-black rounded-full h-full w-[13.75rem] p-[0.29rem] flex justify-center items-center overflow-hidden"
                                        id="layer-img"
                                   >
                                        <div
                                             id="img-profile"
                                             className="h-full w-full rounded-full overflow-hidden flex justify-center items-center"
                                        >
                                             {
                                                  user_information.img ? 
                                                  <img
                                                       className="h-full w-auto object-cover rounded-full block"
                                                       src={user_information ? user_information.img : "..."}
                                                       alt="Profile Image"
                                                  />
                                                       :
                                                  <Loadingdiv/>
                                             }
                                        </div>
                                   </div>
                              </div>
                         </div>
                    </div>
               </div>


          <div className="items-perfil grid grid-cols-3 justify-center items-center box-border text-white max-w-[95%] w-[95%] h-auto p-[0.2rem] bg-[#131016]">
                    <div
                         className="max-sm:text-[1.1rem] items-grid flex flex-col justify-center text-center leading-[1.4] font-['Franklin_Gothic_Medium','Arial_Narrow',Arial,sans-serif] py-2 w-full bg-[#131016] p-0 text-[1.3rem] [word-spacing:40px] box-content justify-self-center"
                         id="username-text"
                    >
                         {user_information ? user_information.username : "..."}
                    </div>

                    <div
                         className="items-grid flex flex-col max-sm:gap-[.7rem] max-sm:w-[95%] max-sm:flex-row justify-center text-center leading-[1.4] font-['Franklin_Gothic_Medium','Arial_Narrow',Arial,sans-serif] py-2 w-1/2 bg-[#281e35] box-content justify-self-center"
                         id="account-div"
                    >
                         <span>Accounts</span>
                         <span>{user_information?.accounts_selled}</span>
                    </div>

                    <div
                         className="items-grid flex flex-col max-sm:gap-[.7rem] max-sm:w-[95%] max-sm:flex-row justify-center text-center leading-[1.4] font-['Franklin_Gothic_Medium','Arial_Narrow',Arial,sans-serif] py-2 w-1/2 bg-[#281e35] box-content justify-self-center"
                         id="services-div"
                    >
                         <span>Services</span>
                         <span>{user_information?.services_selled}</span>
                    </div>
               </div>


               <div className="description-profile-layer flex justify-center items-center box-border text-center p-4 w-[95%] bg-[#131016]">
                    <div className="description-profile bg-[rgb(40,30,53)] w-full box-border px-12 py-4 max-[32.6rem]:px-4">
                         <p className="max-[32.6rem]:text-[0.81rem] text-white">
                              {user_information.description}
                         </p>
                    </div>
               </div>

               <div className="product-profile-layer h-[27.1rem] max-sm:h-[16rem] w-[95%] box-border flex justify-center items-center p-4 bg-[#131016]">
                    <div className="product-profile-content w-full flex justify-center items-center p-4 bg-[rgb(40,29,54)] h-full">
                         <article
                              className="product-profile focus w-full h-full justify-self-center self-center flex justify-center items-center bg-[rgb(16,14,17)]"
                              id="account-product"
                         ></article>

                         <article
                              className="product-profile display w-full h-full justify-self-center self-center flex justify-center items-center bg-[rgb(16,14,17)] hidden"
                              id="services-product"
                         >
                              adios
                         </article>

                         <article
                              className="product-profile display w-full h-full justify-self-center self-center flex justify-center items-center bg-[rgb(16,14,17)] hidden"
                              id="assets-product"
                         >
                              bye
                         </article>
                    </div>
               </div>
          </>
     );
}
