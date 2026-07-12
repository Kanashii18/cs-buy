export default async function OrderAccount(reply, db, product_, userInfo, order_id){

     try {
                         
          // 1. Obtener el primer Product_Account para el seller_id y product_id
          const productAccountQuery = `
               SELECT * FROM Product_Accounts
               WHERE seller_id = ? AND product_id = ?
          `;

          // Obtener el primer resultado con .get()
          const result_product = await db(productAccountQuery, [product_.user_id, product_.product_id]);
          const product = result_product[0];
          if (result_product.length <= 0) {
               throw Error('Product account not found');
          }
          
          const deleteQuery = `
               DELETE FROM Product_Accounts
               WHERE account_id = ?
          `;

          const  result = await db(deleteQuery, [product.account_id]);
          if (result.affectedRows > 0) {
               console.log('Cuenta eliminada correctamente');
          } else {
               console.log('No se encontró la cuenta o no se pudo eliminar');
          }
          const reduce_quantity = `
               UPDATE Products
               SET quantity = quantity - 1
               WHERE product_id = ? AND deleted = 0; 
          `;
          const r = await db(reduce_quantity, [product_.product_id]);
          if (r.affectedRows > 0) {
               console.log('Cuenta eliminada correctamente');
          } else {
               console.log('No se encontró la cuenta o no se pudo eliminar');
          }
          // // Create Order // 
          try {

               console.table({
                    order_id: order_id,
                    product_id: product_.product_id,
                    user_id: userInfo.id,
                    image: product_.image,
                    title: product_.title,
                    type: product_.category,
                    seller_id: product_.user_id,
                    quantity: 1,
                    price: product_.price,
                    information: result_product[0].information,
                    status: "pending"
               });

               const query = `
                    INSERT INTO Orders (
                         order_id,
                         product_id,
                         user_id,
                         product_image,
                         product_title,
                         product_type,
                         seller_id,
                         quantity,
                         price_at_purchase,
                         information,
                         status
                    )
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
               `;

               await db(query, [
                    order_id,
                    product_.product_id,
                    userInfo.id,
                    product_.image,
                    product_.title,
                    product_.category,
                    product_.user_id,
                    1,
                    product_.price,
                    result_product[0].information,
                    "pending"
               ]);

          } catch (error) {
               throw Error(error.message);
          }
     } catch (err) {
          throw Error(err.message);
     }
}