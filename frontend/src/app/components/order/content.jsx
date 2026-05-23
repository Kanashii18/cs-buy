import { div } from '@tensorflow/tfjs';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useRouter } from "next/navigation";
import { AlertDialog } from '../../scripts/alertbox/alertbox.jsx';
import { openAlert } from '../../scripts/alertbox/alertbox.js';

export default function Order_Content({LoadingScene, newSocket}){

     // obtener id desde param    
     const id_param = new URLSearchParams(window.location.search);
     let id = id_param.get("o");
     const router = useRouter();

     const [orderData, setOrderData] = useState(null); // Estado para almacenar los datos de la orden
     const [loading, setLoading] = useState(true); // Estado de carga
     const [active, isActive] = useState(false);
     
     const [haveFeedback, completeFeedback] = useState(false);
     const [rating, setRating] = useState(0);
     const [feedback, setFeedback] = useState('');
     const [isConfirming, setconfirming] = useState(false); 
     const [isConfirmed, setconfirmed] = useState(false); 
     const [issendingFeedback, sendingFeedback] = useState(false); 

     useEffect(()=>{
          if(!orderData) return;
          const userId = orderData.seller_id;
          newSocket.emit("user:isOnline", { userId }, res => {

               console.log('order mi vida', res.isOnline);
               isActive(res.isOnline)
          });
     },[orderData])

     // Función para manejar la selección de estrellas
     const handleMouseEnter = (index) => {
          setRating(index);  // Cambiar la calificación al pasar el mouse
     };

     const handleClick = (index) => {
          setRating(index);  // Al hacer clic, asignamos la calificación
     };

     const handleSubmit = async() => {
          // Verifica que tanto el texto como el rating estén presentes
          if (!feedback.trim() || typeof(feedback) !== "string" || rating === 0) {
               alert("Por favor, ingrese un comentario y seleccione una calificación.");
               return;
          }
          sendingFeedback(true);
          try{
               const res = await fetch('/api/seller/set-feedback', {
                    method: 'POST',
                    credentials:"include",
                    headers: {
                         'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                         order_id: id,
                         comment: feedback,  // El contenido del textarea
                         stars: rating,  // La calificación seleccionada
                    })
               })
               if(!res.ok) return console.error("Error confirming feedback");
               completeFeedback(true);
          }catch(err){
               console.error(err)
          }finally{
               sendingFeedback(false)
          }
     };

     const handleConfirm = async () => {
          const option = await openAlert("Are you sure you want to confirm?","Confirm",'#c79dcf30') 
          if(!option) return;
          setconfirming(true);
          const response = await fetch(`/api/order/confirm-product?o=${id}`, {
               method: 'PUT',
               credentials: 'include', 
          });
          if (!response.ok) {
               throw new Error('Error al confirmar orden');
          }
          setconfirming(false);
          setconfirmed(true);
     };

     const containerVariants = {
          hidden: { opacity: 0 },
          visible: {
               opacity: 1,
               transition: {
                    staggerChildren: 0.15, // delay entre animaciones de hijos
               },
          },
     };

     const itemVariants = {
          hidden: { opacity: 0, x: 50 }, // empieza desplazado a la derecha y oculto
          visible: { opacity: 1, x: 0 },  // aparece en posición
     };

     const [category_value,setcategory_value] = useState("");
       
     useEffect(() => {
          if (loading) return;

          if (orderData.category === "Account") {
               setcategory_value(
                    <div className='order__content'>
                         <p style={{ whiteSpace: "pre-line" }}>{orderData.information}</p>
                    </div>
               );
          } else if (orderData.category === "Service") {
               setcategory_value(
                    <div className='order__content' style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
                         <span style={{ color: "#ffffff8c" }}>
                              texto de servicio, por favor, contactar con el vendedor en el chat
                         </span>
                         <p style={{ whiteSpace: "pre-line" }}>{orderData.information}</p>
                    </div>
               );
          } else if (orderData.category === "Others") {
               setcategory_value(
                    <div className='order__content' style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>

                         <span style={{ color: "#ffffff8c" }}>
                              Contenido descargable, consulta al vendedor para instrucciones, ojo! ejecutar scripts solo en caso de tener conocimientos previos...
                         </span>

                         <div className='download-content' style={{
                              display:"flex",
                              flexDirection:'column',
                              alignItems:"center",
                              gap:"1rem"
                         }}>
                              <div className='file-name' style={{color:"#ffffffc2"}}>
                                   {orderData.name}
                              </div>
                              <a href={orderData.information} style={{
                                   width:"min-content",
                                   backgroundColor:"#2d1b3d",
                                   padding:".2rem",
                                   borderRadius:"10px"
                              }} >
                                   <div className='download_text-content' style={{
                                        backgroundColor:"#483756",
                                        padding:"1rem 2rem",     
                                        borderRadius:"10px"
                                   }}>
                                        <div className='download_text'>Download</div>
                                   </div>
                              </a>
                         </div>
                    </div>
               );
          }
     }, [loading, orderData]);


     useEffect(() => {
          // Función para obtener los productos de la API
          (async()=>{
               // Aquí asumimos que la URL es /order/product
                    const response = await fetch(`/api/order/product?o=${id}`, {
                         method: 'GET',  // O 'POST' si tu API espera un POST
                         headers: {
                         'Content-Type': 'application/json',
                         },
                         credentials: 'include',  // Asegura que las cookies (como session_token) se envíen si es necesario
                    });

                    if (!response.ok) {
                         router.push("/dashboard/order");
                         // throw new Error('Error al obtener los productos de la orden');
                    }
                    const data = await response.json();
                    completeFeedback(data.have_feedback);
                    setOrderData(data); // Guarda los datos recibidos
                    setLoading(false);
          })()
               .finally(()=> setLoading(false))
     }, []);

     if (loading) {
          return <LoadingScene/>;
     }

     if (!orderData) {
          return <div>No products found in this order.</div>;
     }

     const feedback_option = 
          <>
               {!haveFeedback ? 
                    <div className="bg-[#00000080] p-[0.2rem] text-order ">
                         <div className="flex flex-col gap-[0.4rem] bg-[#00000023] p-[0.2rem]">
                              <div className="flex bg-[#47397780] w-max py-[0.1rem] px-[0.2rem]">
                                   {[1, 2, 3, 4, 5].map((index) => (
                                        <img
                                             key={index}
                                             onClick={() => handleClick(index)}
                                             onMouseEnter={() => handleMouseEnter(index)}
                                             src={index <= rating ? "../assets/icons/star.svg" : "../assets/icons/star_none.svg"}
                                             alt="Star"
                                             width="30"
                                             height="30"
                                             className="w-6"
                                             style={{ cursor: 'pointer' }}
                                        />
                                   ))}
                              </div>

                              <div className="flex flex-col gap-[0.3rem] bg-[#47397780] p-[0.3rem]">
                                   <div className="bg-[#0000006c] w-max py-[0.2rem] px-[0.4rem] text-[#b3b3b3] text-[0.99rem]">
                                        Comment
                                   </div>

                                   <div className="flex flex-col items-end bg-[#0007] p-[0.4rem]">
                                        <textarea
                                             placeholder="Type a Feedback..."
                                             className="w-full h-20 overflow-y-scroll bg-transparent resize-none outline-none"
                                             onChange={(e) => setFeedback(e.target.value)}
                                        />

                                        {issendingFeedback ? 
                                             <div className="inline-block relative w-[50px] h-[50px] text-[#7a4e94]">
                                                  <div className="box-border block absolute w-[34px] h-[34px] m-2 border-[5px] border-solid border-current rounded-full animate-[lds-ring_1.2s_cubic-bezier(.5,0,.5,1)_infinite] border-t-current border-r-transparent border-b-transparent border-l-transparent [animation-delay:-0.45s]"></div>
                                                  <div className="box-border block absolute w-[34px] h-[34px] m-2 border-[5px] border-solid border-current rounded-full animate-[lds-ring_1.2s_cubic-bezier(.5,0,.5,1)_infinite] border-t-current border-r-transparent border-b-transparent border-l-transparent [animation-delay:-0.3s]"></div>
                                                  <div className="box-border block absolute w-[34px] h-[34px] m-2 border-[5px] border-solid border-current rounded-full animate-[lds-ring_1.2s_cubic-bezier(.5,0,.5,1)_infinite] border-t-current border-r-transparent border-b-transparent border-l-transparent [animation-delay:-0.15s]"></div>
                                                  <div className="box-border block absolute w-[34px] h-[34px] m-2 border-[5px] border-solid border-current rounded-full animate-[lds-ring_1.2s_cubic-bezier(.5,0,.5,1)_infinite] border-t-current border-r-transparent border-b-transparent border-l-transparent"></div>
                                             </div>
                                             :
                                             <button className="bg-transparent cursor-pointer" onClick={handleSubmit}>
                                                  <img src="../assets/icons/send.svg" alt="Send feedback" />
                                             </button>
                                        }
                                   </div>
                              </div>
                         </div>
                    </div>
               :
                    <div className="p-[0.6rem] bg-[#00000057]">
                         <div className="text-[#c9d8e3] text-[0.98rem] text-center">
                              Thanks you for your feedback!
                         </div>
                    </div>
               }
          </>

     return(
          <>
               <motion.div
                    variants={containerVariants}
                    className="grid gap-12 grid-cols-[1fr_auto] grid-rows-[min-content] h-full my-8 mx-24 max-[767px]:my-12 max-[767px]:mx-4 max-[767px]:w-full max-[767px]:grid-cols-[auto] max-[767px]:grid-rows-[auto] font-sans font-[100] [word-spacing:0.4rem]"
               >
                    <motion.div
                         variants={itemVariants}
                         className="col-span-2 max-[767px]:col-auto"
                    >
                         <div className="flex gap-4 justify-self-start break-all max-[38rem]:break-normal text-order">
                              <div className="w-min h-min bg-[#211429] p-[0.4rem]">
                                   <div className="w-20 h-[-webkit-fill-available]">
                                        <img
                                             className="overflow-hidden w-20 h-20 object-cover aspect-square"
                                             src={orderData.image}
                                             alt="product image"
                                        />
                                   </div>
                              </div>

                              <div className="flex flex-col gap-6 py-[0.3rem]">
                                   <div className="w-full p-[0.2rem]">
                                        <div className="text-[20px]">
                                             <h5>
                                                  {orderData.title}
                                             </h5>
                                        </div>
                                   </div>

                                   <div className="text-[17px]">
                                        <h5>{orderData.created_at
                                                  .replace('T', ' ')
                                                  .replace('.000Z', '')}</h5>
                                   </div>
                              </div>
                         </div>
                    </motion.div>

                    <motion.div
                         variants={itemVariants}
                         className="bg-[bisque] h-min w-min max-[767px]:justify-self-center"
                    >
                         <div className="bg-[#251a31] w-min p-4 gap-4 flex flex-col text-order">
                              <div className="flex w-full justify-between">
                                   <h4 className="text-[1.1rem]">Seller</h4>
                                   <a href={`/dashboard/message?id=${orderData.room}&o=${orderData.seller_id}`}>
                                        <img src="../assets/icons/options/chat.svg" alt="icon chat"/>
                                   </a>
                              </div>

                              <div className="flex gap-6 bg-[#00000080] p-2 items-[anchor-center] mx-0 mt-0 mb-[0.8rem]">
                                   <div className="w-min h-min bg-[#211429] p-[0.2rem] w-12 rounded-full">
                                        <div className="w-max h-[-webkit-fill-available]">
                                             <img
                                                  className="w-12 h-12 rounded-full overflow-hidden object-cover aspect-square"
                                                  src={orderData.user.img}
                                                  alt="seller image"
                                             />
                                        </div>
                                   </div>

                                   <div className="bg-[#211429] p-[0.2rem]">
                                        <div className="flex items-center gap-[3.8rem] py-[0.4rem] px-[1.8rem] bg-[#39294b96] w-full h-full">
                                             <h4>{orderData.user.username}</h4>
                                             <div className={`h-2 rounded-full aspect-square bg-[${active ? "#4cf136" : "#797979"}]`}></div>
                                        </div>
                                   </div>
                              </div>

                              <div className="bg-[#0000002e] w-min whitespace-nowrap p-[0.4rem]">
                                   Price Order: {orderData.price_at_purchase}$
                              </div>

                              {orderData.status !== "pending" || isConfirmed ?
                                   feedback_option
                              :
                              <>
                                   {isConfirming ? 
                                        <div className="h-20 flex justify-center bg-[#0000004a]">
                                             <img src=" ../assets/loadcat.svg"/>
                                        </div>
                                   :
                                        <>
                                             <span className="text-[#ffffff8c]">Confirmar unicamente al verificar el producto...</span>
                                             <button onClick={handleConfirm} className="cursor-pointer w-min bg-[#64ba9d] p-[0.12rem] mt-[1.7rem]">
                                                  <div className="bg-[#1b1917] pt-[0.8rem] pr-[1.5rem] pb-[0.7rem] pl-[1.5rem] whitespace-nowrap">
                                                       Confirm Product
                                                  </div>
                                             </button>
                                        </>
                                   }
                              </>
                              }    
                         </div>
                    </motion.div>

                    <motion.div
                         variants={itemVariants}
                         className="bg-[#251a31] p-[0.7rem] h-min w-[44.006875rem] max-[767px]:w-full"
                    >
                         <div className="bg-[#30213f] p-[0.4rem] flex flex-col gap-4 text-order">
                              <div className="py-[0.8rem] px-4 bg-[#00000085] w-min">
                                   {orderData.status === "pending" ?
                                        <h4>Pending</h4>
                                   :
                                        <h4>Confirmed</h4>
                                   }
                              </div>

                              <div className="h-[25rem] overflow-y-scroll bg-[#00000085] p-4 max-[767px]:w-full max-[767px]:w-full">
                                   {category_value}
                              </div> 
                         </div>
                    </motion.div>
               </motion.div>

               <AlertDialog/>
          </>
     )
};