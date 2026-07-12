export async function getRating({ request, reply, db }) {
  const userInfo = request.userInfo;

  const rating = `
    SELECT
      AVG(stars) AS average_stars, 
      (AVG(stars) * 20) AS percentage 
    FROM Feedbacks 
    WHERE user_id = ?;
  `;

  try {
    const result_rating = await db(rating, [userInfo.id]);
    const rating_value = (Math.round(parseFloat(result_rating[0].percentage) * 100) / 100).toFixed(2);
    return reply.send({ rating_value });
  } catch (err) {
    console.error('Error fetching rating:', err);
    return reply.code(500).send({ error: 'Error fetching rating' });
  }
}
