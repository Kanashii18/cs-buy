export default async ({db, request, reply}) => {
     const { roomId } = request.body;
     try {
          // Usamos mysql2 para realizar la consulta
          const results = await db(`
               SELECT * FROM Messages
               WHERE chat_id = ?
               ORDER BY timestamp ASC
          `, [roomId]);

          reply.send(results); // Responder con los mensajes encontrados
     } catch (err) {
          console.error(err);
          reply.code(500).send({ error: 'Error leyendo mensajes' });
     }
}