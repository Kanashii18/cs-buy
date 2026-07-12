export async function getFeedback({ request, reply, db }) {
  const { user_id } = request.body;

  if (!user_id) {
    return reply.code(400).send({ error: 'Missing user_id in request body' });
  }

  try {
    const userExistsStmt = `SELECT 1 FROM Users WHERE user_id = ?`;
    const userExists = await db(userExistsStmt, [user_id]);

    if (userExists.length === 0) {
      return reply.code(404).send({ error: 'User not found' });
    }

    const feedbacksStmt = `
      SELECT 
        f.feedback_id,
        f.user_id,
        f.product_id,
        f.client_id,
        f.comment,
        f.stars,
        f.created_at,
        u.username AS user_username,
        u.img AS user_img
      FROM Feedbacks f
      JOIN Users u ON f.client_id = u.user_id
      WHERE f.user_id = ?
      ORDER BY f.created_at DESC
    `;
    const feedbacks = await db(feedbacksStmt, [user_id]);

    return reply.send(feedbacks);
  } catch (error) {
    console.error('DB error fetching feedbacks:', error);
    return reply.code(500).send({ error: 'Database error' });
  }
}
