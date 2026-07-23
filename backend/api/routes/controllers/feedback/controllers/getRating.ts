import { Feedback } from "../../../../types/feedback/index.type.ts";

export async function getRating({ request, reply, db } : Feedback.Params) : Promise<void> {
     const userInfo = request.userInfo;
     try {
          const result_rating = await db(`
               SELECT
                    AVG(stars) AS average_stars, 
                    (AVG(stars) * 20) AS percentage 
               FROM Feedbacks 
               WHERE user_id = ?;
          `, [userInfo.id]);
          const rating_value = (Math.round(parseFloat(result_rating[0].percentage) * 100) / 100).toFixed(2);
          return await reply.send({ rating_value });
     } catch (err) {
          console.error('Error fetching rating:', err);
          return await reply.code(500).send({ error: 'Server Error' });
     }
}
