/**
 * Get products for the top bar.
 */
export default async function getNav_Product({db, request, reply}) {
     const searchTerm = request.query.product; // Obtiene el término de búsqueda
     const sql = `
          SELECT product_id, title, price, image, category
          FROM Products 
          WHERE title LIKE ? AND quantity > 0 AND deleted = 0
          ORDER BY CHAR_LENGTH(title) - CHAR_LENGTH(REPLACE(title, ?, '')) DESC 
          LIMIT 10
     `;
     const values = [`%${searchTerm}%`, searchTerm];

     try {
          const results = await db(sql, values);
          reply.send(results); // Devuelve los resultados de la búsqueda
     } catch (err) {
          console.error(err);
          return reply.code(500).send({ error: 'Error al realizar la búsqueda' });
     }
}
