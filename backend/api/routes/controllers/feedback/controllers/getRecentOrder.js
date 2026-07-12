export async function getRecentOrder({ request, reply, db }) {
  const userInfo = request.userInfo;

  try {
    const userExistsStmt = `
      SELECT product_image, product_title, price_at_purchase, created_at
      FROM Orders
      WHERE seller_id = ? AND status = 'confirmed'
      ORDER BY created_at DESC
    `;

    const orders = await db(userExistsStmt, [userInfo.id]);

    const response = orders.map(order => {
      return {
        product_image: order.product_image,
        product_title: order.product_title,
        price_at_purchase: order.price_at_purchase,
        time: order.created_at
      };
    });

    return reply.code(200).send(response);
  } catch (error) {
    console.error('DB error fetching feedbacks:', error);
    return reply.code(500).send({ error: 'Database error' });
  }
}
