export default async ({ db, request, reply }) => {
     const { id, u, s } = request.query;
     try {

          // extract creation chat date, why search sayns find the table white the "x" u id and "x" s id
          // or vice versa "x" s id and "x" u id... that's why we send [ u, s, OR s, u ]
          let created_at = await db(`SELECT created_at FROM chat_user_room_status 
                                        WHERE (user_id = ? AND other_id = ?)
                                        OR (user_id = ? AND other_id = ?)`,[u, s, s, u]);
          created_at = created_at[0].created_at
          
          const query = 'SELECT title, image, product_id FROM Products WHERE product_id = ?';
          const result = await db(query, [id]);

          if (result.length === 0) {
               return reply.code(404).send({ message: 'Producto no encontrado' });
          }

          const { title, image, product_id } = result[0];
          reply.send({ title, image, product_id, created_at });
     } catch (err) {
          console.log(err);
          return reply.code(500).send({ message: 'Error al buscar el producto' });
     }
}