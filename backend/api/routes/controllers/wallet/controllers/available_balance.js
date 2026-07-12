export default async function available_balance({request, reply, db}) {
  // TODO: mover/extraer la lógica desde wallet.controller.js
  try {
    const userInfo = request.userInfo;
    const rows = await db('SELECT balance, pending FROM Wallets WHERE user_id = ?', [userInfo.id]);
    if (rows.length === 0) return reply.code(404).send({ error: 'Wallet not found' });
    const { balance, pending } = rows[0];
    const available_balance = parseFloat(balance) - parseFloat(pending);
    return reply.code(200).send({ available_balance });
  } catch (error) {
    console.error('Error fetching available balance:', error);
    return reply.code(500).send({ error: 'Internal server error' });
  }
}
