export default async function pending_balance({request, reply, db}) {
  // TODO: mover/extraer la lógica desde wallet.controller.js
  try {
    const userInfo = request.userInfo;
    const rows = await db('SELECT pending FROM Wallets WHERE user_id = ?', [userInfo.id]);
    if (rows.length === 0) return reply.code(404).send({ error: 'Wallet not found' });
    const { pending } = rows[0];
    return reply.code(200).send({ pending });
  } catch (error) {
    console.error('Error fetching pending balance:', error);
    return reply.code(500).send({ error: 'Internal server error' });
  }
}
