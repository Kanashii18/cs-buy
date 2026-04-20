// SOLO CAMBIOS NECESARIOS SOBRE TU ARCHIVO :contentReference[oaicite:0]{index=0}

import React, { useState, useRef } from 'react';
import { useSearchParams, useRouter } from "next/navigation";
import LoadingText from "../../../scripts/loadingText";
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'; // ← CAMBIO
import GPayButton from "../../components/GPayButton"; // ajusta ruta

export default function Head_stripe({ onError, onSuccess, clientSecret }) {
    const [email, setEmail] = useState("");
    const stripe = useStripe();    
    const elements = useElements();
    const [isProcessing, setIsProcessing] = useState(false);
    const router = useRouter();
    const submittingRef = useRef(false);

    const setError = (error) => {
        console.log(error);
        onError(error.length === 0 ? "Invalid card, date or cvv" : error);
        setTimeout(()=>{ onSuccess(); },5000);
    }

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (submittingRef.current) return;
        submittingRef.current = true;

        if (!stripe || !elements) return;

        setIsProcessing(true);

        // 🔥 REEMPLAZA TODO TU FLUJO POR ESTE
        const { error } = await stripe.confirmPayment({
            elements,
            redirect: "if_required",
            confirmParams: {
                return_url: window.location.origin + "/dashboard/order",
            },
        });

        if (error) {
            setError(error.message);
            setIsProcessing(false);
            submittingRef.current = false;
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
                            className="w-full rounded-[.35rem] border border-[#7c6583] bg-[#0d0c14] px-10 py-4 text-[#D6E4EF]"
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
                            className="w-full rounded-[.35rem] border border-[#7c6583] bg-[#0d0c14] px-10 py-4 text-[#D6E4EF]"
                        />
                    </div>
                </div>

                <div className="rounded-[.35rem] border border-[#7c6583] bg-[#0d0c14] px-10 py-4">
                    <GPayButton amount={1000} clientSecret={clientSecret} />
                    <PaymentElement /> {/* ← CAMBIO */}
                </div>

                <div className="flex w-full items-center rounded-[8px] bg-transparent">
                    <button type="submit" className="bg-[#a66caa] w-full rounded-[8px]">
                        <div className="bg-black/94 rounded-[7px] py-[1.2rem] px-[1.2rem]">
                            <span className="text-white/70">
                                {isProcessing ? <LoadingText text={"Buying"} color={"white/70"} checkout={true}/> : "Buy"}
                            </span>
                        </div>
                    </button>
                </div>

            </div>
        </form>
    );
}