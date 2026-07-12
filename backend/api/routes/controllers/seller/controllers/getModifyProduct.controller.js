/**
 * Fetches all products from the database.
 */
export default async function getModifyProduct({db, request, reply}) {
     const product_id = request.query.e;
          const userInfo = request.userInfo;
          try {
               const query = `
                    SELECT 
                         title,
                         price,
                         deliveryUnit,
                         delivery_value,
                         image,
                         category,
                         quantity,
                         description
                    FROM Products
                    WHERE user_id = ? AND product_id = ? AND deleted = 0
               `;
               const products = await db(query, [userInfo.id, product_id]);

               if (products.length === 0) {
                    return reply.code(404).send({ error: 'Product not found' });
               }

               let result;
               console.log(products[0].category);
               if(products[0].category.toLowerCase() === 'account'){

                    
                    console.log(products[0].quantity);
                    const qty = Number.isInteger(products[0].quantity)
                         ? products[0].quantity
                         : 0;

                    const query_account = `
                         SELECT information, account_id
                         FROM Product_Accounts
                         WHERE product_id = ?
                         ORDER BY account_id
                         LIMIT ${qty}
                    `;

                    const raw = await db(query_account, [product_id]);

                    // Normalizar a array de objetos
                    let rows;
                    if (Array.isArray(raw)) {
                         // Caso: driver devuelve [rows, fields] -> raw[0] es el array de filas
                         if (raw.length > 0 && Array.isArray(raw[0])) {
                              rows = raw[0];
                         } else {
                              // Caso: driver devuelve directamente rows (array) o un array de 1 objeto
                              rows = raw;
                         }
                    } else if (raw && typeof raw === "object") {
                         // Caso: devuelve un único objeto (una fila)
                         rows = [raw];
                    } else {
                         rows = []; // null/undefined/otro
                    }

                    // Ahora rows es siempre un array de objetos
                    console.log("rows isArray?", Array.isArray(rows), "length:", rows.length);
                    console.log(rows);
                    
                    result = {
                         title: products[0].title,
                         price: products[0].price,
                         image: products[0].image,
                         deliveryUnit: products[0].deliveryUnit,
                         delivery_value: products[0].delivery_value,
                         category: products[0].category,
                         quantity: products[0].quantity,
                         description: products[0].description,
                         service_msg: "",
                         asset_name:"",
                         accounts: rows
                    };
               }
               else if(products[0].category.toLowerCase() === 'service'){
                    const query_account = `
                         SELECT 
                              information, service_id
                         FROM Product_Service
                         WHERE product_id = ?
                    `;
                    const content = await db(query_account, [product_id]);
                    result = {
                         title: products[0].title,
                         price: products[0].price,
                         image: products[0].image,
                         deliveryUnit: products[0].deliveryUnit,
                         delivery_value: products[0].delivery_value,
                         category: products[0].category,
                         quantity: products[0].quantity,
                         description: products[0].description,
                         service_msg: content[0].information,
                         asset_name: "",
                         accounts:[]
                    };
               }
               else if(products[0].category.toLowerCase() === 'others'){
                    const query_account = `
                         SELECT 
                              asset_name, asset_id
                         FROM Product_Asset
                         WHERE product_id = ?
                    `;
                    const content = await db(query_account, [product_id]);
                    console.log(content);
                    result = {
                         title: products[0].title,
                         price: products[0].price,
                         image: products[0].image,
                         deliveryUnit: products[0].deliveryUnit,
                         delivery_value: products[0].delivery_value,
                         category: products[0].category,
                         quantity: products[0].quantity,
                         description: products[0].description,
                         asset_name: content[0].asset_name,
                         service_msg: "",
                         accounts:[]
                    };
               }
               
               return reply.code(200).send(result);

          } catch (error) {
               console.error('Error getting products:', error.message);
               logger.log(`Error getting products: ${error.message}`, 'error');
               return reply.code(500).send({ error: 'Error getting products' });
          }
}
