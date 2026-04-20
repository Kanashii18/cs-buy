// /components/GPayButton.jsx

import { useEffect, useState } from "react";
import { useStripe, PaymentRequestButtonElement } from "@stripe/react-stripe-js";

export default function GPayButton({ amount, clientSecret }) {
  const stripe = useStripe();
  const [paymentRequest, setPaymentRequest] = useState(null);

  useEffect(() => {
    if (!stripe || !clientSecret) return;

    const pr = stripe.paymentRequest({
      country: "US",
      currency: "usd",
      total: {
        label: "Total",
        amount: amount,
      },
      requestPayerEmail: true,
    });

    pr.canMakePayment().then(result => {
      if (result) setPaymentRequest(pr);
    });

    pr.on('paymentmethod', async (ev) => {
      const { error } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: ev.paymentMethod.id,
        },
        { handleActions: false }
      );

      if (error) {
        ev.complete('fail');
      } else {
        ev.complete('success');
      }
    });

  }, [stripe, clientSecret]);

  if (!paymentRequest) return null;

  return <PaymentRequestButtonElement options={{ paymentRequest }} />;
}