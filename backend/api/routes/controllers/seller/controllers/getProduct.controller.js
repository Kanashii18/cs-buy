/**
 * Fetches all products from the database.
 */
export default async function getProduct({db, request, reply}) {
     const text = request.body.text;
     const category = request.body.category;
     const lowestPrice = request.body.min_price;
     const highestPrice = request.body.max_price;

     try {
          const query  = `
               SELECT 
                    p.product_id,
                    u.user_id,
                    p.title,
                    p.price,
                    p.category,
                    p.quantity,
                    p.active,
                    p.image,
                    p.description,
                    u.username AS seller_name,
                    u.rate AS seller_rate 
               FROM Products p
               JOIN Users u ON p.user_id = u.user_id
               WHERE p.quantity > 0 AND p.active = True AND p.deleted = 0
               AND p.price BETWEEN ? AND ?
               ${category !== "any" ? "AND p.category = ?" : ""}
               ${text ? "AND p.title LIKE ?" : ""}
               ;
          `
          const config = [
               Number(lowestPrice),
               Number(highestPrice),
               ...(category !== "any" ? [category[0].toUpperCase() + category.slice(1)] : []),
               ...(text != null ? [`%${text}%`] : []),
          ];
                              
          // add price condition...
          console.log(query,config);
          const products = await db(query, config);

          return reply.code(200).send(products);

     } catch (error) {
          console.error('\n\n\n\nError getting products:', error,"\n\n\n\n");
          return reply.code(500).send({ error: 'Error getting products' });
     }
}
