import { randomUUID } from 'crypto';

export default async function({db, io, users, request, reply}) {
     const userInfo = request.userInfo;
     const product = request.product;
     let order_id = randomUUID();

     if (product.type === 'Account') {
          try {
               const productAccountQuery = `
                    SELECT * FROM Product_Accounts
                    WHERE seller_id = ? AND product_id = ?
               `;
               const result_product = await db(productAccountQuery, [product.seller_id, product.product_id]);

               if (result_product.length <= 0) {
                    return reply.code(404).send({ error: 'Product account not found' });
               }

               const deleteQuery = `
                    DELETE FROM Product_Accounts
                    WHERE account_id = ?
               `;
               await db(deleteQuery, [result_product[0].account_id]);

               const reduce_quantity = `
                    UPDATE Products
                    SET quantity = quantity - 1
                    WHERE product_id = ? AND deleted = 0;
               `;
               await db(reduce_quantity, [product.product_id]);

               try {
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
                         product.type,
                         product.seller_id,
                         userInfo.id,
                         1,
                         product.price,
                         result_product[0].information,
                         'pending',
                    ]);
               } catch (error) {
                    console.error('Error creating order:', error.message);
                    return reply.code(500).send({ error: 'Error creating order' });
               }
          } catch (err) {
               console.error('Error verifying product token:', err.message);
               return reply.code(500).send({ error: 'Error verifying product token' });
          }
     } else if (product.type == 'Service') {
          try {
               const productAccountQuery = `
                    SELECT * FROM Product_Service
                    WHERE seller_id = ? AND product_id = ?
               `;
               const result_product = await db(productAccountQuery, [product.seller_id, product.product_id]);

               if (result_product.length <= 0) {
                    return reply.code(404).send({ error: 'Product account not found' });
               }

               try {
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
                         product.type,
                         product.seller_id,
                         userInfo.id,
                         1,
                         product.price,
                         result_product[0].information,
                         'pending',
                    ]);
               } catch (error) {
                    console.error('Error creating order:', error.message);
                    return reply.code(500).send({ error: 'Error creating order' });
               }
          } catch (err) {
               console.error('Error verifying product token:', err.message);
               return reply.code(500).send({ error: 'Error verifying product token' });
          }
     } else if (product.type == 'Others') {
          try {
               const productAccountQuery = `
                    SELECT asset_id, asset_name, asset_link FROM Product_Asset
                    WHERE seller_id = ? AND product_id = ?
               `;
               const result_product = await db(productAccountQuery, [product.seller_id, product.product_id]);

               if (result_product.length <= 0) {
                    return reply.code(404).send({ error: 'Product account not found' });
               }

               const inactive = `
                    UPDATE Product_Asset
                    SET active = FALSE
                    WHERE product_id = ?;
               `;
               await db(inactive, [product.product_id]);

               try {
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
                              status,
                              asset_name
                         )
                         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    `;
                    await db(query, [
                         order_id,
                         product.product_id,
                         product.image,
                         product.title,
                         product.type,
                         product.seller_id,
                         userInfo.id,
                         1,
                         product.price,
                         result_product[0].asset_link,
                         'pending',
                         result_product[0].asset_name,
                    ]);
               } catch (error) {
                    console.error('Error creating order:', error.message);
                    return reply.code(500).send({ error: 'Error creating order' });
               }
          } catch (err) {
               console.error('Error verifying product token:', err.message);
               return reply.code(500).send({ error: 'Error verifying product token' });
          }
     }

     const chat_id = randomUUID();

     const checkQuery = `
          SELECT COUNT(*) AS count
          FROM chat_user_room_status
          WHERE (user_id = ? AND other_id = ?) OR (user_id = ? AND other_id = ?)
     `;

     const chatRoomResult = await db(checkQuery, [userInfo.id, product.seller_id, product.seller_id, userInfo.id]);

     if (chatRoomResult[0].count === 0) {
          const query_chat = `
               INSERT INTO chat_user_room_status (
                    id,
                    user_id,
                    other_id,
                    listing_id,
                    timestamp
               )
               VALUES (?, ?, ?, ?, ?)
          `;
          await db(query_chat, [
               chat_id,
               userInfo.id,
               product.seller_id,
               product.product_id,
               new Date().toISOString().slice(0, 19).replace('T', ' '),
          ]);
     }

     const notification = `
          INSERT INTO Notifications (
               id,
               user_id,
               product_id,
               image,
               title,
               price,
               buyer
          ) VALUES (?, ?, ?, ?, ?, ?, ?)
     `;

     const id = randomUUID();
     await db(notification, [
          id,
          product.seller_id,
          product.product_id,
          product.image,
          product.title,
          product.price,
          userInfo.username,
     ]);

     const receiverSocketId = users[product.seller_id];
     if (receiverSocketId) {
          const receiverSocket = io.sockets.sockets.get(receiverSocketId);
          if (receiverSocket) {
               console.log(`Socket ${product.seller_id} enviado`);
               receiverSocket.emit('notification', {
                    receiver: product.seller_id,
                    message: 'buyed',
                    quantity: 1,
               });
          } else {
               console.log(`Socket ${product.seller_id} no está conectado.`);
          }
     } else {
          console.log(`Usuario ${product.id} no encontrado.`);
     }

     return reply.code(200).send({ message: 'Order created successfully' });
}
