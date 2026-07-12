export default async function({db, request, reply}) {
     const userId = request.query.id;

     if (!userId) {
          return reply.status(400).send({ error: 'User id is required' });
     }

     try {
          const query = `
               SELECT user_id, username, img, description
               FROM Users
               WHERE user_id = ?
          `;

          try {
               const results = await db(query, [userId]);

               if (results.length === 0) {
                    return reply.status(404).send({ error: 'User not found' });
               }

               return reply.send(results[0]);
          } catch (err) {
               console.error('Error querying users table:', err);
               return reply.status(500).send({ error: 'Internal server error' });
          }
     } catch (error) {
          console.error('Unexpected error:', error);
          return reply.status(500).send({ error: 'Internal server error' });
     }
}
