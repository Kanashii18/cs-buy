export default async function({ db, request, reply }) {
     const userId = request.query.id;

     if (!userId) {
          return reply.status(400).send({ error: 'User id is required' });
     }

     try {
          const query = `
               SELECT user_id, username, img, description, email
               FROM Users
               WHERE user_id = ?
          `;
          const result = await db(query, [userId]);

          if (!result) {
               return reply.status(500).send({ error: 'Internal server error' });
          }

          if (result.length === 0) {
               return reply.status(404).send({ error: 'User not found' });
          }

          return reply.send(result[0]);
     } catch (error) {
          console.error('Unexpected error:', error);
          return reply.status(500).send({ error: 'Internal server error' });
     }
}
