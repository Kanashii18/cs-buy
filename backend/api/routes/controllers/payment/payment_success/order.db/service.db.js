export default async function OrderService(reply, db, product, userInfo, order_id) {
     try {
          // 1. Obtener el primer Product_Account para el seller_id y product_id
          const productAccountQuery = `
               SELECT * FROM Product_Service
               WHERE seller_id = ? AND product_id = ?
          `;

          const result_product = await db(productAccountQuery, [product.user_id, product.product_id]);

          if (result_product.length <= 0) {
               throw Error('Product account not found');
          }

          try {
               
               // =================== // Create Order // =================== // 
               const query = `
                    INSERT INTO Orders (
                         order_id,
                         product_id,
                         product_image,
                         product_title,
                         product_type,
                         seller_id,
                         user_id,
                         quantity,
                         price_at_purchase,
                         information,
                         status
                    )
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
               `;

               await db(query, [
                    order_id,
                    product.product_id,
                    product.image,
                    product.title,
                    product.category,
                    product.user_id,
                    userInfo.id,
                    1,
                    product.price,
                    result_product[0].information,
                    "pending"
               ]);
               // ========================================================== //
          } catch (error) {
               console.log(error);
               throw Error('Error creating order:', error.message);
          }
     } catch (err) {
          console.log(err);
          throw Error('Error creating order:', err);
     }
}