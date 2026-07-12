import Stripe from 'stripe';
import { STRIPE_SECRET_KEY } from '../../../../config/env';
const stripe = Stripe(STRIPE_SECRET_KEY);

export default async function retire_balance({request, reply, db}) {
  // TODO: mover/extraer la lógica desde wallet.controller.js
  try {
    const userInfo = request.userInfo;
    const userQuery = `SELECT role, email FROM Users WHERE user_id = ?`;
    const user = await db(userQuery, [userInfo.id]);
    if (user.length === 0) return reply.code(404).send({ error: 'User not found' });

    if (user[0].role === 'user') {
      const account = await stripe.accounts.create({
        type: 'standard',
        email: user[0].email,
        country: 'US',
        business_type: 'individual',
      });

      const accountLinks = await stripe.accountLinks.create({
        account: account.id,
        refresh_url: 'https://cs-buy.com/reauth',
        return_url: 'https://cs-buy.com/success',
        type: 'account_onboarding',
      });

      return reply.code(200).send({ url: accountLinks.url });
    }

    return reply.code(204).send();
  } catch (error) {
    console.error('Error in retire_balance:', error);
    return reply.code(500).send({ error: 'Internal server error' });
  }
}
