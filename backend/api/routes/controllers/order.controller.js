import jwt from 'jsonwebtoken';
import Stripe from 'stripe';
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

export function purchasedController(db) {
     return {
          // Obtener los productos comprados por el usuario
          get_purchased_by_user: async (request, reply) => {
               const token = request.cookies.session_token;

               if (!token) {
                    return reply.code(401).send({ error: 'Unauthorized' });
               }

               let userInfo;
               try {
                    userInfo = jwt.verify(token, process.env.SECRET_KEY);
               } catch (err) {
                    return reply.code(403).send({ error: 'Invalid or expired token' });
               }

               const query = `
                    SELECT order_id, product_id, product_image, product_title, seller_id, status, created_at
                    FROM Orders
                    WHERE user_id = ?
               `;

               try {
                    const purchasedItems = await db(query, [userInfo.id]);
                    return reply.code(200).send(purchasedItems);
               } catch (error) {
                    console.error('Error fetching purchased items:', error.message);
                    return reply.code(500).send({ error: 'Unknown error, try later' });
               }
          },

          // Obtener información de un producto específico
          get_specific_product: async (request, reply) => {
               const userInfo = request.userInfo; 
           

               const id = request.query.o;

               const productQuery = `
                    SELECT
                         have_feedback,
                         product_id,
                         product_image,
                         product_title,
                         seller_id,
                         user_id,
                         status,
                         price_at_purchase,
                         created_at,
                         information,
                         product_type,
                         asset_name
                    FROM Orders
                    WHERE order_id = ? AND user_id = ?
               `;
               try {
                    const order = await db(productQuery, [id, userInfo.id]);
                    if (order.length <= 0) {
                         return reply.code(404).send({ error: 'Order not found' });
                    }

                    const chatparam = `
                         SELECT id
                         FROM chat_user_room_status
                         WHERE (user_id = ? AND other_id = ?)
                              OR (user_id = ? AND other_id = ?)
                    `;

                    const chatroom = await db(chatparam, [
                         userInfo.id, order[0].seller_id,
                         order[0].seller_id, userInfo.id
                    ]);

                    const userQuery = `
                         SELECT username, img
                         FROM Users
                         WHERE user_id = ?
                    `;
                    const user = await db(userQuery, [order[0].seller_id]);
                    console.log(order[0].have_feedback,"el watoonn");
                    const result = {
                         have_feedback: order[0].have_feedback === 1 ? true : false,
                         order_id: id,
                         room: chatroom[0]?.id || null,
                         product_id: order[0].product_id,
                         seller_id: order[0].seller_id,
                         user_id: order[0].user_id,
                         status: order[0].status,
                         category: order[0].product_type,
                         created_at: order[0].created_at,
                         title: order[0].product_title,
                         image: order[0].product_image,
                         price_at_purchase: order[0].price_at_purchase,
                         information: order[0].information,
                         name: order[0].asset_name,
                         user: {
                              username: user[0]?.username,
                              img: user[0]?.img
                         }
                    };

                    return reply.send(result);
               } catch(err) {
               console.error(err);
               return reply.code(500).send({ error: "Server Error" });
               }
          },

          // Confirmar un producto
          confirm_product: async (request, reply) => {
               const id = request.query.o;
               const userInfo = request.userInfo;

               try {
                    const read_payment = `
                         SELECT payment_gateway, payment_id, amount, wallet_id
                         FROM Payments
                         WHERE order_id = (SELECT order_id FROM Orders WHERE order_id = ? AND user_id = ?)
                    `;  
                    
                    const payment = await db(read_payment, [id, userInfo.id]);

                    if(payment[0].payment_gateway === "stripe"){
                         const paymentIntent = await stripe.paymentIntents.capture(payment[0].payment_id);
                         if(paymentIntent.status === "succeeded"){    
                              const update_payment = `
                                   UPDATE Payments
                                   SET status = 'completed'
                                   WHERE order_id = (SELECT order_id FROM Orders WHERE order_id = ? AND user_id = ?)
                              `;
                              await db(update_payment, [id, userInfo.id]);

                              const update_balance = `
                                   UPDATE Wallets
                                   SET balance = balance + ?, pending = pending - ?
                                   WHERE wallet_id = ?;
                              `;
                              await db(update_balance, [payment[0].amount, payment[0].amount, payment[0].wallet_id]);
                              const productQuery = `
                                   UPDATE Orders
                                   SET status = 'confirmed'
                                   WHERE order_id = ? AND user_id = ?
                              `;
                              await db(productQuery, [id, userInfo.id]);
                              return reply.code(200).send({message:'OK'});
                         }
                    }
                    return reply.code(500).send({error:'unknown error, try again later'});     
               } catch (err) {
                    console.log(err);
                    return reply.code(500).send({ error: 'Error updating order' });
               }
          }
     };
}f