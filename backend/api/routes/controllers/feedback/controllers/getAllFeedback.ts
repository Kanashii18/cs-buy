import { Feedback } from "../../../../types/feedback/index.type.ts";

export async function getAllFeedback({ request, reply, db } : Feedback.Params) : Promise<void> {
     const userInfo = request.userInfo;

     try {
          const feedbacks = await db(`
               SELECT client_id, comment, stars, created_at
               FROM Feedbacks
               WHERE user_id = ?
          `, [userInfo.id]);

          return reply.code(200).send({ feedbacks });
     } catch (error) {
          console.error('DB error fetching feedbacks:', error);
          return reply.code(500).send({ error: 'Server error' });
     }
}
