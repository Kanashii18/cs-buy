import Stripe from 'stripe';
import { STRIPE_SECRET_KEY } from '../../../../config/env';
const stripe = Stripe(STRIPE_SECRET_KEY);

export default async function checkout({request, reply}) {
  // TODO: mover/extraer la lógica desde wallet.controller.js
  try {
    const sig = request.headers['stripe-signature'];
    let event;
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
    try {
      event = stripe.webhooks.constructEvent(request.body, sig, endpointSecret);
    } catch (err) {
      console.error(`Error al verificar el webhook: ${err.message}`);
      return reply.code(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object;
      console.log('Pago recibido, ID de la transacción: ', paymentIntent.id);
    }

    if (event.type === 'transfer.created') {
      const transfer = event.data.object;
      console.log('Transferencia creada, ID de la transferencia: ', transfer.id);
      console.log('Monto de la transferencia: ', transfer.amount);
    }

    if (event.type === 'transfer.updated') {
      const transfer = event.data.object;
      console.log('Transferencia actualizada, ID de la transferencia: ', transfer.id);
      console.log('Nuevo estado de la transferencia: ', transfer.code);
      if (transfer.code === 'succeeded') {
        console.log('La transferencia al vendedor fue exitosa.');
      } else if (transfer.code === 'failed') {
        console.log('La transferencia al vendedor falló.');
      }
    }

    return reply.code(200).send('Evento recibido');
  } catch (error) {
    console.error('Error in checkout handler:', error);
    return reply.code(500).send({ error: 'Internal server error' });
  }
}
