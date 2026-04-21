import Error_windows from './payments/error';

import { useState, useEffect } from 'react';
import Head_stripe from './payments/stripe';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
const loaderSvg = "../assets/icons/loader/payment_loader.svg";

const testing = false;
const stripePromise = loadStripe(testing ? 
     "pk_test_51RuTndBZL3uHJlLtnFRg17FDRgk0umD0C8ZxaWPNeR8IitM2GynHSmI9fV8moPMkJCb7550VqYByEnhirlVf2THI00vnkxCN6O" 
     :
     "pk_live_51RuTnVAyoQ9na92j82j3znsgW3VwPXQWmfdMnMHvfRl0YLJnfX2RRWPNFmTgxMIfxWvJ9Pp9L395p37RgAhD1Q8u00nQRESuAt"
);

export default function Method({product}) {
     const [loading, setLoading] = useState(false);
     const [active_error, setError] = useState(false);
     const [msg_error, setMessage] = useState(null);
     const [visiblePaymentMethod, setVisiblePaymentMethod] = useState(null); // Guardamos la opción visible

     const handleBack = () => {
          window.history.back();
          setTimeout(() => {
               window.location.reload();
          }, 100);
     };

     // PayPal payment handler
     useEffect(() => {
          const script = document.createElement('script');
          script.src = "https://www.paypal.com/sdk/js?client-id=AXyj2EyPs3TWtT8pmro77pkOo-xL82tKHe_-GhDtvPQ9zoCwHZt8J1ypYwstKFlwDLZbRSMruAjV8jNs&components=buttons";
          script.async = true;
          document.body.appendChild(script);

          script.onload = () => {
               window.paypal.Buttons({
                    // Esta función crea la orden de pago en el backend
                    createOrder: (data, actions) => {
                         return fetch('/api/verify/checkout/paypal/pay', {
                              method: 'POST',
                              headers: {
                                   'Content-Type': 'application/json',
                              },
                              body: JSON.stringify({
                                   amount: '10.00', // Monto de la transacción
                              }),
                         })
                         .then(response => response.json()) // Recibimos el approval_url
                         .then(data => {
                              // Redirigir al usuario a la URL de PayPal
                              window.location.href = data.approval_url; // Redirigimos para que el comprador apruebe el pago
                              return data.approval_url; // Opcional, si lo necesitas
                         });
                    },

                    // Esta función se ejecuta cuando el comprador aprueba el pago en PayPal
                    onApprove: (data, actions) => {
                         // Obtenemos el paymentId y payerId de los parámetros de la URL (cuando el comprador regresa)
                         const urlParams = new URLSearchParams(window.location.search);
                         const paymentId = urlParams.get('paymentId');
                         const payerId = urlParams.get('PayerID');
                         console.log("las weas de paypal",payerId,paymentId);
                         if (paymentId && payerId) {
                              // Llamamos a la API de backend para capturar el pago y almacenar el dinero en la wallet local
                              return fetch(`/api/verify/checkout/paypal/capture`, {
                                   method: 'GET', // Se podría hacer POST si prefieres enviar estos parámetros en el cuerpo
                                   headers: {
                                   'Content-Type': 'application/json',
                                   },
                                   body: JSON.stringify({ paymentId, payerId }), // Enviamos los parámetros para capturar
                              })
                              .then(response => response.json())
                              .then(data => {
                                   console.log(data);
                                   // Mostrar mensaje de éxito
                                   alert('Transacción completada con éxito');
                              })
                              .catch(error => {
                                   console.error('Error al capturar el pago:', error);
                              });
                         } else {
                              alert('Faltan los parámetros de pago');
                         }
                    },
               }).render('#paypal-button-container'); // Renderiza el botón de PayPal
               };

               // return () => {
               //      document.body.removeChild(script);
               // };
          }, []);

     // Crypto payment handler (Example with Coinbase Commerce)
     const handleCryptoPayment = async () => {
               setLoading(true);
               fetch("/api/verify/checkout/crypto_payment/pay", {
                    method: "POST",
                    credentials:"include",
                    headers: {
                         "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ amount: 10.00 }) // Ajusta el monto de acuerdo a lo que se necesite
               }).then((r)=>{r.json()})
                    .then((data)=>{
                         if (data.status === 'success') {
                              alert('Crypto payment created successfully');
                              window.location.href = data.payment_url; // Redirigir a la URL de pago de crypto
                         } else {
                              alert('Error creating crypto payment');
                         }
                    })
                    .catch((err)=>console.error(err))
                    .finally(()=>setLoading(false));          
          };

     // Cambia la visibilidad de las opciones de pago
     const toggleVisibility = (method) => {
          setVisiblePaymentMethod(visiblePaymentMethod === method ? null : method);
     };

     return (
          <div className="w-full p-2.5 h-min">
               <div className="flex flex-col gap-20 w-[70%] p-4 justify-self-end max-[66.2rem]:w-full">
                    <div className="w-[100%] h-[2.4rem] flex">
                         <div className='w-[2.4rem] h-[2.4rem]'>
                              <button
                                   onClick={handleBack}
                                   className="cursor-pointer w-full aspect-square rounded-[25%] pt-[0.3rem] pr-0 pb-[0.3rem] pl-[0.6rem] bg-[#4b3458] transition-colors duration-300 ease-in-out flex cursor-pointer hover:bg-[#6f4e82]"
                              >
                                   <img src="../assets/icons/options/back-arrow.svg" alt="back button" />
                              </button>
                         </div>
                         
                         <Error_windows active={active_error} msg={msg_error}/>
                    </div>

                    <div className="flex flex-col gap-4 w-full">
                         <div className="w-min pt-[0.8rem] pr-[1.2rem] pb-[0.8rem] pl-[1.2rem] rounded-[5px]">
                              <h4 className="whitespace-nowrap text-[#f3f3f3f5] tracking-[0.07rem]">
                                   Payment Method
                              </h4>
                         </div>

                         <div
                              className="bg-[rgb(66,38,83)] transition-colors duration-300 ease-in-out w-full h-[3.54875rem] rounded-[5.5px] pt-[0.9rem] pr-8 pb-[0.9rem] pl-8 text-center break-words flex justify-between items-center cursor-pointer hover:bg-[#483557]"
                              onClick={() => toggleVisibility('credit-card')}
                         >
                              <h4 className="m-0 text-[16px] font-bold whitespace-normal break-normal [overflow-wrap:normal] text-[#f3f3f3f5] tracking-[0.07rem]">
                                   Credit Card
                              </h4>
                              <div className="flex gap-[0.23rem]">
                                   <img className="w-[2.625rem] h-[1.75rem]" src="../assets/icons/payment/card_icon/Mastercard-Dark.svg" alt="MasterCard icon" />
                                   <img className="w-[2.625rem] h-[1.75rem]" src="../assets/icons/payment/card_icon/Visa-Dark.svg" alt="Visa icon" />
                                   <img className="w-[2.625rem] h-[1.75rem]" src="../assets/icons/payment/card_icon/Discover-Dark.svg" alt="Discover icon" />
                              </div>
                         </div>

                         {/* max-height transition needs CSS */}
                         <div
                              className={`max-h-0 overflow-hidden [transition:max-height_0.5s_ease-in-out] ${visiblePaymentMethod === 'credit-card' ? 'max-h-[500px]' : ''}`}
                         >
                              <Elements stripe={stripePromise}>
                                   <Head_stripe product={product} 
                                        onError={(error)=>{ 
                                             setMessage(error);
                                             setError(true); 
                                        }}
                                        onSuccess={()=>{
                                             setError(false);
                                        }}
                                   />
                              </Elements>
                         </div>

                         <div
                              className="bg-[rgb(66,38,83)] transition-colors duration-300 ease-in-out w-full h-[3.54875rem] rounded-[5.5px] pt-[0.9rem] pr-8 pb-[0.9rem] pl-8 text-center break-words flex justify-between items-center cursor-pointer hover:bg-[#483557]"
                              onClick={() => toggleVisibility('paypal')}
                         >
                              <h4 className="m-0 text-[16px] font-bold whitespace-normal break-normal [overflow-wrap:normal] text-[#f3f3f3f5] tracking-[0.07rem]">
                                   Paypal
                              </h4>
                              <div className="flex gap-[0.23rem]">
                                   <img className="w-[2.625rem] h-[1.75rem]" src="../assets/icons/payment/paypal/modified.svg" alt="Paypal icon" />
                              </div>
                         </div>

                         <div
                              className={`max-h-0 overflow-hidden [transition:max-height_0.5s_ease-in-out] ${visiblePaymentMethod === 'paypal' ? 'max-h-[500px]' : ''}`}
                         >
                              <div id="paypal-button-container"></div>
                         </div>

                         <div
                              className="bg-[rgb(66,38,83)] transition-colors duration-300 ease-in-out w-full h-[3.54875rem] rounded-[5.5px] pt-[0.9rem] pr-8 pb-[0.9rem] pl-8 text-center break-words flex justify-between items-center cursor-pointer hover:bg-[#483557]"
                              onClick={() => toggleVisibility('crypto')}
                         >
                              <h4 className="m-0 text-[16px] font-bold whitespace-normal break-normal [overflow-wrap:normal] text-[#f3f3f3f5] tracking-[0.07rem]">
                                   Cryptocurrency
                              </h4>
                              <div className="flex gap-[0.23rem]">
                                   <img className="w-[2.625rem] h-[1.75rem]" src="../assets/icons/payment/crypto_icon/BTC-Dark.svg" alt="BTC icon" />
                                   <img className="w-[2.625rem] h-[1.75rem]" src="../assets/icons/payment/crypto_icon/Ethereum-Dark.svg" alt="Ethereum icon" />
                                   <img className="w-[2.625rem] h-[1.75rem]" src="../assets/icons/payment/crypto_icon/LTC-Dark.svg" alt="LTC icon" />
                                   <img className="w-[2.625rem] h-[1.75rem]" src="../assets/icons/payment/crypto_icon/USDC-Dark.svg" alt="USDC icon" />
                              </div>
                         </div>

                         <div
                              className={`max-h-0 overflow-hidden [transition:max-height_0.5s_ease-in-out] ${visiblePaymentMethod === 'crypto' ? 'max-h-[500px]' : ''}`}
                         >
                              {loading ? (
                                   <button
                                        className="product__button-submit"
                                        onClick={handleCryptoPayment}
                                        disabled={true}
                                        style={{ backgroundColor: "#45a049", height: "3.46rem" }}
                                   >
                                        <div
                                             className="product__button-layer"
                                             style={{ padding: "0 3rem", height: "-webkit-fill-available" }}
                                        >
                                             <img
                                                  src={loaderSvg}
                                                  alt="Loading"
                                                  style={{
                                                       width: "3.2rem",
                                                       height: "3.2rem",
                                                       objectFit: "contain",
                                                  }}
                                             />
                                        </div>
                                   </button>
                              ) : (
                                   <button className="product__button-submit" onClick={handleCryptoPayment}>
                                        <div className="product__button-layer">
                                             <h4 className="whitespace-nowrap text-[#f3f3f3f5]">
                                                  Pay with Crypto
                                             </h4>
                                        </div>
                                   </button>
                              )}
                         </div>
                    </div>
               </div>
          </div>
     );
}