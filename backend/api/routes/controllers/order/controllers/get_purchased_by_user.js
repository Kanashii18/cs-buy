
export default async function get_purchased_by_user({ request, reply, db }) {
  const token = request.cookies.session_token;

  if (!token) {
    return reply.code(401).send({ error: 'Unauthorized' });
  }

  let userInfo = request.userInfo;
  if(!userInfo) return reply.code(404).send({ error: 'Unauthorized' });

  const query = `
    SELECT order_id, product_id, product_image, product_title, seller_id, status, created_at
    FROM Orders
    WHERE user_id = ?
  `;

  try {
    const purchasedItems = await db(query, [userInfo.id]);
    return reply.code(200).send(purchasedItems);
  } catch (error) {
    console.error('Error fetching purchased items:', error.message);
    return reply.code(500).send({ error: 'Unknown error, try later' });
  }
}
