export async function getAllFeedback({ request, reply, db }) {
  const userInfo = request.userInfo;

  try {
    const userExistsStmt = `
      SELECT client_id, comment, stars, created_at
      FROM Feedbacks
      WHERE user_id = ?
    `;
    const feedbacks = await db(userExistsStmt, [userInfo.id]);

    return reply.code(200).send({ feedbacks });
  } catch (error) {
    console.error('DB error fetching feedbacks:', error);
    return reply.code(500).send({ error: 'Database error' });
  }
}
