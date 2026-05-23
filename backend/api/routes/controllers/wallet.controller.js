
// ============== // Stripe Configuration // ============== // 
import Stripe from 'stripe';
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
// ======================================================== // 

export function WalletController(db){
     return{
          available_balance: async(request,reply) => {
               try {
                    const userInfo = request.userInfo;

                    const rows = await db(
                         'SELECT balance FROM Wallets WHERE user_id = ?',
                         [userInfo.id]
                    );

                    if (rows.length === 0) {
                         return reply.code(404).send({ error: 'Wallet not found' });
                    }

                    const { balance, pending } = rows[0];
                    const available_balance = parseFloat(balance) - parseFloat(pending);

                    return reply.code(200).send({ available_balance });
               } catch (error) {
                    console.error('Error fetching available balance:', error);
                    return reply.code(500).send({ error: 'Internal server error' });
               }
          },
          pending_balance: async(request,reply) => {
               try {
                    
                    const userInfo = request.userInfo;

                    const rows = await db(
                         'SELECT pending FROM Wallets WHERE user_id = ?',
                         [userInfo.id]
                    );

                    if (rows.length === 0) {
                         return reply.code(404).send({ error: 'Wallet not found' });
                    }

                    const { pending } = rows[0];
                    return reply.code(200).send({ pending });
               } catch (error) {
                    console.error('Error fetching pending balance:', error);
                    return reply.code(500).send({ error: 'Internal server error' });
               }
          },
          total_balance: async(request,reply) => {
               try {
                    const userInfo = request.userInfo;

                    const rows = await db(
                         'SELECT balance, pending, wallet_id FROM Wallets WHERE user_id = ?',
                         [userInfo.id]
                    );

                    if (rows.length === 0) {
                         return reply.code(404).send({ error: 'Wallet not found' });
                    }

                    const { balance, pending, wallet_id } = rows[0];
                    console.log(balance, pending, wallet_id);

                    return reply.code(200).send({ available:balance, pending:pending });
               } catch (error) {
                    console.error('Error fetching available balance:', error);
                    return reply.code(500).send({ error: 'Internal server error' });
               }
          },
          retire_balance: async(request,reply) => {
               const userInfo = request.userInfo;

               const userQuery = `
                    SELECT role, email FROM Users WHERE user_id = ?
                    `;
               const user = await db(userQuery,[userInfo.id]);

               if(user[0].role === 'user'){
                    const account = await stripe.accounts.create({
                         type: 'standard',
                         email: user[0].email,
                         country: 'US',
                         business_type: 'individual'
                    });

                    const accountLinks = await stripe.accountLinks.create({
                         account: account.id,
                         refresh_url: 'https://cs-buy.com/reauth',
                         return_url: 'https://cs-buy.com/success',
                         type: 'account_onboarding',
                    });
                    console.log(accountLinks);
                    return reply.code(200).send({ url: accountLinks.url });
               }
               return;
          },
          transitions: async(request,reply) => {
               try {
                    const userInfo = request.userInfo;

                    const rows = await db(
                         'SELECT * FROM Transactions WHERE user_id = ? AND wallet_id = (SELECT id FROM Wallets WHERE user_id = ?)',
                         [userInfo.id, userInfo.id]
                    );

                    return reply.code(200).send({ transactions: rows });
               } catch (error) {
                    console.error('Error fetching transactions:', error);
                    return reply.code(500).send({ error: 'Internal server error' });
               }
          },
          checkout: async(request,reply) => {
               const sig = request.headers['stripe-signature'];

               let event;

               try {
                    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
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

               reply.code(200).send('Evento recibido');
          }
     };
};