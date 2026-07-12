export async function getTotalSelled({ request, reply, db }) {
  const userInfo = request.userInfo;

  try {
    const totalselled = `
      SELECT 
        COUNT(CASE WHEN product_type = 'Account' THEN 1 END) AS total_account,
        COUNT(CASE WHEN product_type = 'Service' THEN 1 END) AS total_service,
        COUNT(CASE WHEN product_type = 'Assets' THEN 1 END) AS total_assets
      FROM Orders
      WHERE seller_id = ? AND status = 'confirmed'
    `;
    const totalcount = await db(totalselled, [userInfo.id]);

    return reply.code(200).send({
      total_account: totalcount[0].total_account || 0,
      total_service: totalcount[0].total_service || 0,
      total_assets: totalcount[0].total_assets || 0
    });
  } catch (error) {
    console.error('DB error fetching total selled:', error);
    return reply.code(500).send({ error: 'Database error' });
  }
}
