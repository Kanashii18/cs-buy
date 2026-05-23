import { randomUUID } from 'crypto';
import jwt from 'jsonwebtoken';

// ============= || Variables de entorno || ============ //

import dotenv from 'dotenv';
dotenv.config();

// ============= || Login Section || ============ //

export function checkout_Controller(db, io, users) {
     return {
          // Get Checkout token session 
          get_session: async (request, reply) => {
               const userInfo = request.userInfo;
               const { product_id } = request.body;
               
               if (!product_id) {
                    return reply.code(400).send({ error: 'Missing product_id in request body' });
               }
               const id_session = randomUUID();
               const query = `
                    INSERT INTO Checkout_id (
                         id,
                         user_id,
                         product_id,
                         expires_at
                    ) VALUES (?, ?, ?, DATE_ADD(NOW(), INTERVAL 2 MINUTE))
               `;
     
               try{
                    await db(query, [ id_session, userInfo.id, product_id]);

                    // remove others checkout session with the client's user id... 
                    await db( `
                         DELETE FROM Checkout_id
                              WHERE user_id = ?
                              AND id <> ?
                         `,
                    [userInfo.id, id_session]
                    );


                    return reply.send({ session_id: id_session });
               }catch{
                    return reply.code(500).send({ error: 'Database error' });
               }

               //      const payload = {
               //           product: {
               //                product_id,
               //                user_id: userInfo.id,
               //                seller_id: product[0].user_id,
               //                price:product[0].price,
               //                category:product[0].category,
               //                title:product[0].title,
               //                image:product[0].image
               //           },
               //           issuedAt: Date.now(),
               //      };
          },
          getCheckoutProduct: async (request, reply) => {
               const userInfo = request.userInfo;
               const checkout_id = request.query.session_id;

               try {
                    // verify the session_token
                    const query = `
                         SELECT 
                              product_id
                         FROM Checkout_id
                         WHERE id = ? AND user_id = ? AND expires_at > NOW();
                    `;
                    const session = await db(query, [checkout_id, userInfo.id]);
                    if (session.length === 0) return reply.code(404).send({ error: 'Expired Or Invalid Session' });

                    // search the product...
                    const query_product = `
                         SELECT 
                              p.product_id,
                              u.user_id,
                              p.title,
                              p.price,
                              p.category,
                              p.deliveryUnit,
                              p.delivery_value,
                              p.quantity,
                              p.image,
                              u.username AS seller_name
                         FROM Products p
                         JOIN Users u ON p.user_id = u.user_id
                         WHERE p.product_id = ? AND p.quantity > 0 AND p.deleted = 0;
                    `;
                    const product = await db(query_product, [session[0].product_id]);
                    
                    // if we don't find any product, return 404
                    if(product.length === 0) return reply.code(404).send({ error: 'Non-existent Product' });
                    reply.code(200).send(product[0]);

               } catch (error) {
                    console.error('Error getting product:', error.message);
                    reply.code(500).send({ error: 'Error getting product' });
               }
          },
          // ============= || Order Section || ============= // 

          get_order: async (request, reply) => {
               const userInfo = request.userInfo;

               try {
                    // Usamos mysql2 para la consulta
                    const orders = await db(`
                         SELECT *
                         FROM Orders
                         WHERE user_id = ?
                    `, [userInfo.user_id]);

                    reply.code(200).send(orders);
               } catch (error) {
                    console.error('Error getting orders:', error.message);
                    reply.code(500).send({ error: 'Error getting orders' });
               }
          },

          post_order: async (request, reply) => {
               const userInfo = request.userInfo;
               const product = request.product;
               // ---------- Confirm Product Token ------------- // 

               // Get And Remove Product // 

               let order_id = randomUUID(); // UUID v4

               if(product.type === "Account"){
                    
                    try {
                         
                         // 1. Obtener el primer Product_Account para el seller_id y product_id
                         const productAccountQuery = `
                              SELECT * FROM Product_Accounts
                              WHERE seller_id = ? AND product_id = ?
                         `;

                         // Usar .get() para obtener un solo registro
                         const result_product = await db(productAccountQuery, [product.seller_id, product.product_id]);

                         // let seller_id = result_product[0].seller_id;

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

                         // Create Order // 
                         try {
                              const order_id = randomUUID(); // UUID v4
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
                                   "pending"
                              ]);

                         } catch (error) {
                              console.error('Error creating order:', error.message);
                              reply.code(500).send({ error: 'Error creating order' });
                         }
                    } catch (err) {
                         console.error('Error verifying product token:', err.message);
                         return reply.code(500).send({ error: 'Error verifying product token' });
                    }

               }else if(product.type == "Service"){
                    try {
                         
                         // 1. Obtener el primer Product_Account para el seller_id y product_id
                         const productAccountQuery = `
                              SELECT * FROM Product_Service
                              WHERE seller_id = ? AND product_id = ?
                         `;

                         const result_product = await db(productAccountQuery, [product.seller_id, product.product_id]);

                         if (result_product.length <= 0) {
                              return reply.code(404).send({ error: 'Product account not found' });
                         }

                         // Create Order // 
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
                                   "pending"
                              ]);

                         } catch (error) {
                              console.error('Error creating order:', error.message);
                              reply.code(500).send({ error: 'Error creating order' });
                         }
                    } catch (err) {
                         console.error('Error verifying product token:', err.message);
                         return reply.code(500).send({ error: 'Error verifying product token' });
                    }
               }else if(product.type == "Others"){
                    try {
                         
                         // 1. Obtener el primer Product_Account para el seller_id y product_id
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
                         `
                         await db(inactive,[product.product_id]);

                         // Create Order // 
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
                                   "pending",
                                   result_product[0].asset_name
                              ]);

                         } catch (error) {
                              console.error('Error creating order:', error.message);
                              reply.code(500).send({ error: 'Error creating order' });
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
                    // Create chat
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
                         new Date().toISOString().slice(0, 19).replace('T', ' ')
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
                              message:'buyed',
                              quantity:1
                         }); // Enviamos el mensaje
                    } else {
                         console.log(`Socket ${product.seller_id} no está conectado.`);
                    }
               } else {
                    console.log(`Usuario ${product.id} no encontrado.`);
               }

               // IMPORTANTE: En Fastify necesitamos enviar una respuesta al final
               return reply.code(200).send({ message: 'Order created successfully' });
          }
     };
}