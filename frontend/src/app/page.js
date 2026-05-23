'use client'

import { createSocket } from "./scripts/socket";
import { useState, useEffect  } from "react";
import useSession from "./components/check_session";

import { LoadingScreen } from "./components/loader/main";
import Top_bar from "./components/home/nav-bar/top_bar"; 
import Banner from "./components/home/menu/banner";
import Search_bar from "./components/home/menu/search_bar";
import Product_container from "./components/home/container/product-component/product-container";
import Foot from "./components/home/nav-bar/foot";

// logout handle script //
import { handleLogout } from "./scripts/logout";

//-------------------------------------//

export default function Home(){
     
     const [actual_section, set_section] = useState("");
     const [inputValue, setInputValue] = useState("");

     const handleSubmit = (e) => {
          e.preventDefault();
          onBuscar(inputValue);
     };

     //  =============== || Product search system || ========================= //

     const [filtrados, setFiltrados] = useState([]);
     const [loading_product, setloadingProduct] = useState(true);
     const [loading_socket, loadsockect] = useState(true);
     const [unread_value, set_count] = useState(0);
     const [unread_notification, set_notifications] = useState(0);

     const [category, setCategory] = useState("any");
     const [min_price, setMin] = useState(0);
     const [max_price, setMax] = useState(1000);


     useEffect(() => {
          const section = new URLSearchParams(window.location.search).get("section");
          if (!section) {
               const newUrl = `/?section=global`;
               window.history.replaceState(null, '', newUrl);
               set_section('global');
          } else {
               set_section(section);
          }
     }, []);

     const get_product = async(url, categorie = "any", text = null) => {
          const res = await fetch(url, {
               credentials: "include",
               method: "POST",
               body:JSON.stringify({
                    category: categorie,
                    ...(text != null && { text }),
                    ...(min_price != null && { min_price }),
                    ...(max_price != null && { max_price }),
               }),
               headers: {
                    "Content-Type": "application/json" 
               }
          })
          if(!res.ok) {
               throw new Error("error getting product");
          }
          const data = await res.json();
          setFiltrados(data);
          setloadingProduct(false)
     }


     useEffect(() => {
          (async()=>{
               console.log(actual_section);
               if(actual_section==='global'){
                    await get_product("/api/seller/get-product")
               }
               else if(actual_section==='accounts'){
                    setCategory("accounts");
                    await get_product("/api/seller/get-product","account")
               }
               else if(actual_section==='services'){
                    setCategory("services");
                    await get_product("/api/seller/get-product","service")
               }
          })()
     }, [actual_section]);

     const onBuscar = async(texto) => {
          await get_product(`/api/seller/get-product`,
               category,
               texto ? 
               texto?.toLowerCase() : null);
     };

     // ===============|| Look for the info user ||================ //

    // init lee caché

    const {loggedIn, user, loading} = useSession();

     // ============================= || Check Active User || ============================= //

     // Set unread user count;
     useEffect(()=>{
          // if there's not user just return...
          if(user.length <= 0 || !loggedIn) return;
          if(Object.keys(user).length === 0) return;
          fetch(`/api/chat/unread?id=${user.id}`, { credentials: "include", cache: "no-store" })
               .then(r => r.json())
               .then(data => {
                    console.log(data.unread);
                    set_count(data.unread);
                    set_notifications(data.notice)
               })   
               .catch((err)=>{
                    console.log(err);
               })
               .finally(()=>loadsockect(false));
     },[user])

     useEffect(() => {
          if ( loading_socket || !loggedIn || !user) return;

          const newSocket = createSocket(user.id);
          
          // Listen for unread message count updates
          newSocket.on("unread_check", (unread_count) => {

               set_count(unread__ => {
                    const new_value = unread__ + unread_count.unread;
                    return new_value;
               });
               new Audio('../assets/sound/alert.wav').play().catch(()=>{
                    console.log("user without interaction, sound can't be reproduce");
               });
          });

          // Listen for new notifications
          newSocket.on("notification", (notice) => {

               set_notifications(notice__ => {
                    const new_value = notice__ + notice.quantity;
                    return new_value;
               });
               new Audio('../assets/sound/alert.wav').play();
          });
          return () => {
               newSocket.disconnect();
          };
     }, [ loading_socket, loggedIn, user]);

     return (
          <>
               <Top_bar unread_count={unread_value} loading={loading} unread_notification={unread_notification} handlelogout={handleLogout} loggedIn={loggedIn} user={loggedIn ? user : {}}/>
               <main>
                    <Banner/>
                    <Search_bar setInputValue={setInputValue} handleSubmit={handleSubmit} inputValue={inputValue} />
                    <Product_container productos={filtrados} loading_product={loading_product}
                         setCategory={setCategory}
                         setMin={setMin}
                         setMax={setMax}
                         handleSubmit={handleSubmit}/>
               </main>
               <Foot/>
          </>
     )
};