import React, { useState, useRef } from 'react';
import { useSearchParams, useRouter } from "next/navigation";
import LoadingText from "../../../scripts/loadingText";
import { PaymentElement, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

export default function Head_stripe({onError, onSuccess}) {
    const [email, setEmail] = useState("");
    const param = useSearchParams();
    const stripe = useStripe();    
    const elements = useElements();
    const [isProcessing, setIsProcessing] = useState(false);
    const router = useRouter();
    const submittingRef = useRef(false);

    const setError = (error) => {
        console.log(error);
        onError(error.length === 0 ? "Invalid card, date or cvv" : error);
        setTimeout(()=>{
            onSuccess();
        },5000);
    }

    const style = {
        base: {
            color: '#ffffffde', // Color blanco por defecto
            fontFamily: 'Arial, sans-serif',
            fontSize: '16px',
            '::placeholder': {
                color: '#aab7c4', // Placeholder gris claro
            },
        },
        invalid: {
            color: '#fa755a', // Color rojo para error
            iconColor: '#fa755a',
        },
    };

    // Manejo del envío del formulario
    const handleSubmit = async (event) => {
        event.preventDefault();
        if (submittingRef.current) return;
        submittingRef.current = true;

        if (!stripe || !elements) {
            return;
        }
        setIsProcessing(true);

        const cardElement = elements.getElement(CardElement);
        const cardHolderName = event.target.cardHolder.value;

        const { error, paymentMethod } = await stripe.createPaymentMethod({
            type: 'card',
            card: cardElement,
            billing_details: {
                name: cardHolderName,
                email: email
            },
        });

        if (error) {
            setError("error");
            setIsProcessing(false);
            submittingRef.current = false;
        } else {
            const { id } = paymentMethod;

            // Hacer el pago con el ID del paymentMethod
            fetch(`/api/verify/checkout/stripe/complete?session_id=${param.get("session_id")}`, {
                method: 'POST',
                credentials: "include",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    payment_method: id,
                    cardHolderName
                }),
            })
            .then(async(r) => {
                if(!r.ok) {
                    const data = await r.json();
                    throw new Error(data.error.message);
                }
                return r.json()
            })
            .then(async (data) => {

                try {
                    console.log(data);
                    if(data.status === "requires_action" || data.status === "requires_confirmation"){
                            const { paymentIntent } = await stripe.confirmCardPayment(data.id, {
                                payment_method: {
                                    card: elements.getElement(CardElement),
                                    billing_details: { name: cardHolderName, email },
                                }})
                            if(!paymentIntent) return setError("Declined Card");
                            if (paymentIntent.status === "requires_capture") {
                                console.log('Payment successful');
                                await fetch(`/api/verify/checkout/stripe/payment-status?session_id=${param.get("session_id")}`, {
                                    method: 'POST',
                                    credentials: "include",
                                    headers: {
                                        'Content-Type': 'application/json',
                                    },
                                    body: JSON.stringify({
                                        paymentIntentId: paymentIntent.id,
                                        status: paymentIntent.status,
                                    })
                                }).catch((err)=>{ setError("error"); })
                            } else {
                                console.log('Payment still pending');
                            }
                    }
                    else if(data.status === 'requires_capture'){
                        await fetch(`/api/verify/checkout/stripe/payment-status?session_id=${param.get("session_id")}`, {
                            method: 'POST',
                                credentials: "include",
                                headers: {
                                    'Content-Type':'application/json',
                                },
                            body: JSON.stringify({
                                paymentIntentId: data.payment_id,
                                status: data.status,
                            })
                        })
                        .then(async(r) => {
                            if(!r.ok) {
                                const data = await r.json();
                                throw new Error(data.error.message);
                            }

                            if(r.ok) router.push("/dashboard/order");
                            })
                        .catch((err)=>{ 
                            setError("error");
                        });
                    }
                        
                } catch (err) {
                    console.log(err);
                    setError(err.message);
                }
            })
            .catch((err) => {
                    console.log(err);
                    setError(err.message);
                })
            .finally(() => {
                setIsProcessing(false)
                submittingRef.current = false;
            });
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-4">
                <div className="flex flex-col">
                        <div className="flex w-full flex-col gap-2.5 text-white/85">
                            <input
                                type="text"
                                placeholder="Nombre del titular de la tarjeta"
                                className="w-full rounded-[.35rem] border border-[#7c6583] bg-[#0d0c14] px-10 py-4 text-[var(--fontSize-sm)] font-medium uppercase text-[#D6E4EF] outline-none placeholder:font-medium placeholder:text-[#D6E4EF] focus:outline-none"
                                name="cardHolder"
                            />
                        </div>
                </div>
                <div className="flex flex-col">
                        <div className="flex w-full flex-col gap-2.5 text-white/85">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Correo"
                                className="w-full rounded-[.35rem] border border-[#7c6583] bg-[#0d0c14] px-10 py-4 text-[var(--fontSize-sm)] font-medium uppercase text-[#D6E4EF] outline-none placeholder:font-medium placeholder:text-[#D6E4EF] focus:outline-none"
                            />
                        </div>
                </div>
                <div className="rounded-[.35rem] border border-[#7c6583] bg-[#0d0c14] px-10 py-4">
                        <CardElement options={{ 
                            style: style
                        }} />
                </div>

                <div className="flex w-full items-center rounded-[8px] bg-transparent">
                    <button
                        type="submit"
                        className="bg-[#a66caa] p-0  w-full border-1 uppercase tablet:w-fit text-center transition-all duration-200 hover:shadow-xl font-bold text-sm rounded-[8px] mobile:px-10 cursor-pointer hover:bg-opacity-90 !w-full rounded-[8px] text-center text-black mobile:px-10"
                    >
                        <div className="bg-black/94 cursor-pointer rounded-[7px] my-[1px] mx-[1px] py-[1.2rem] px-[1.2rem]">
                                <span className="pointer-events-none font-bold uppercase text-white/70">
                                {isProcessing ? <LoadingText text={"Buying"} color={"white/70"} checkout={true}/> : "Buy"}
                                </span>
                        </div>
                    </button>
                </div>

                <div className="flex items-center gap-2">
                        <div>
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M3.11111 0C1.393 0 0 1.393 0 3.11112V10.8889C0 12.607 1.393 14 3.11111 14H10.8889C12.607 14 14 12.607 14 10.8889V3.11112C14 1.393 12.607 0 10.8889 0H3.11111ZM7 3.11112C7.42933 3.11112 7.77778 3.45957 7.77778 3.8889C7.77778 4.31824 7.42933 4.66668 7 4.66668C6.57067 4.66668 6.22222 4.31824 6.22222 3.8889C6.22222 3.45957 6.57067 3.11112 7 3.11112ZM7 5.44446C7.42933 5.44446 7.77778 5.79291 7.77778 6.22224V10.1111C7.77778 10.5405 7.42933 10.8889 7 10.8889C6.57067 10.8889 6.22222 10.5405 6.22222 10.1111V6.22224C6.22222 5.79291 6.57067 5.44446 7 5.44446Z" fill="#53535F"></path>
                            </svg>
                        </div>
                </div>
            </div>
        </form>
    );
}
