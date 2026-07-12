export default async function getWallet(db, request, reply) {
     const token = request.cookies.session_token;
     if (!token) {
          return reply.status(401).send({ error: 'Unauthenticated' });
     }
     // Extract user_id from jwt token
     const userId = request.userId;
     if (!userId) {
          return reply.status(404).send("Unauthorized");
     }

     try {
          // Usar el pool de conexiones para hacer la consulta
          const query = 'SELECT * FROM Wallets WHERE user_id = ?';
          const results = await db(query, [userId.id]);

          if (results.length === 0) {
               return reply.status(404).send({ error: 'wallet not found' });
          }

          return reply.send(results[0]); // `results[0]` contiene el primer (y único) resultado

     } catch (error) {
          console.error('Unexpected error:', error);
          return reply.status(500).send({ error: 'Unknown Error' });
     }
}