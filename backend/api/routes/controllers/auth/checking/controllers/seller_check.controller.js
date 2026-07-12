export default async function({ db, request, reply }) {
     const { user_id } = request.body;

     if (!user_id) {
          return reply.status(400).send({ error: 'user_id is required in request body' });
     }

     try {
          const query = `
               SELECT rate, user_id, username, img
               FROM Users
               WHERE user_id = ?
          `;

          try {
               const results = await db(query, [user_id]);

               if (results.length === 0) {
                    return reply.status(404).send({ error: 'User not found' });
               }

               return reply.send(results[0]);
          } catch (err) {
               console.error('Error querying users table:', err);
               return reply.status(500).send({ error: 'Database query error' });
          }
     } catch (error) {
          console.error('Unexpected error:', error);
          return reply.status(500).send({ error: 'Database query error' });
     }
}
