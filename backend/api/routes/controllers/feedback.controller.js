import { randomUUID } from 'crypto'; // Cambiado v4 por randomUUID
import dotenv from 'dotenv';
dotenv.config();

export function gestionFeedback(db, ci) {
     return {
          // =============== Get Feedback =============== //
          getFeedback: async (request, reply) => {
               const { user_id } = request.body;

               if (!user_id) {
                    return reply.code(400).send({ error: 'Missing user_id in request body' });
               }

               try {
                    const userExistsStmt = `
                         SELECT 1 FROM Users WHERE user_id = ?
                    `;
                    const userExists = await db(userExistsStmt, [user_id]);

                    if (userExists.length === 0) {
                         return reply.code(404).send({ error: 'User not found' });
                    }

                    const feedbacksStmt = `
                         SELECT 
                              f.feedback_id,
                              f.user_id,
                              f.product_id,
                              f.client_id,
                              f.comment,
                              f.stars,
                              f.created_at,
                              u.username AS user_username,
                              u.img AS user_img
                         FROM Feedbacks f
                         JOIN Users u ON f.client_id = u.user_id
                         WHERE f.user_id = ?
                         ORDER BY f.created_at DESC
                    `;
                    const feedbacks = await db(feedbacksStmt, [user_id]);

                    return reply.send(feedbacks);
               } catch (error) {
                    console.error('DB error fetching feedbacks:', error);
                    return reply.code(500).send({ error: 'Database error' });
               }
          },

          // =============== Get All Feedback =============== //
          getAllFeedback: async (request, reply) => {
               const userInfo = request.userInfo;

               try {
                    const userExistsStmt = `
                         SELECT client_id, comment, stars, created_at
                         FROM Feedbacks
                         WHERE user_id = ?
                    `;
                    const feedbacks = await db(userExistsStmt, [userInfo.id]);

                    return reply.code(200).send({ feedbacks });
               } catch (error) {
                    console.error('DB error fetching feedbacks:', error);
                    return reply.code(500).send({ error: 'Database error' });
               }
          },

          getRecentOrder: async (request, reply) => {
               const userInfo = request.userInfo;

               try {
                    const userExistsStmt = `
                         SELECT product_image, product_title, price_at_purchase, created_at
                         FROM Orders
                         WHERE seller_id = ? AND status = 'confirmed'
                         ORDER BY created_at DESC
                    `;

                    const orders = await db(userExistsStmt, [userInfo.id]);

                    const response = orders.map(order => {
                         return {
                              product_image: order.product_image,
                              product_title: order.product_title,
                              price_at_purchase: order.price_at_purchase,
                              time: order.created_at
                         };
                    });

                    console.log(`la respuesta ${response[0]}`);
                    return reply.code(200).send(response);

               } catch (error) {
                    console.error('DB error fetching feedbacks:', error);
                    return reply.code(500).send({ error: 'Database error' });
               }
          },

          getTotalSelled: async (request, reply) => {
               const userInfo = request.userInfo;

               try {
                    const totalselled = `
                         SELECT 
                              COUNT(CASE WHEN product_type = 'Account' THEN 1 END) AS total_account,
                              COUNT(CASE WHEN product_type = 'Service' THEN 1 END) AS total_service,
                              COUNT(CASE WHEN product_type = 'Assets' THEN 1 END) AS total_assets
                         FROM Orders
                         WHERE seller_id = ? AND status = 'confirmed'
                    `;
                    const totalcount = await db(totalselled, [userInfo.id]);

                    return reply.code(200).send({
                         total_account: totalcount[0].total_account || 0,
                         total_service: totalcount[0].total_service || 0,
                         total_assets: totalcount[0].total_assets || 0
                    });
               } catch (error) {
                    console.error('DB error fetching total selled:', error);
                    return reply.code(500).send({ error: 'Database error' });
               }
          },

          // =============== Post Feedback =============== //
          postFeedback: async (request, reply) => {
               const userInfo = request.userInfo;

               const { order_id, comment, stars } = request.body;
               if (typeof (order_id) !== "string" || typeof (comment) !== "string" || stars == null || stars == 0) {
                    return reply.code(400).send({ error: 'Missing required fields' });
               }

               const get_product_id = `
                    SELECT product_id, seller_id
                    FROM Orders
                    WHERE user_id = ? 
                    AND order_id = ?
                    AND have_feedback = false;
               `;

               try {
                    const result_product = await db(get_product_id, [userInfo.id, order_id]);

                    let seller_id = result_product[0].seller_id;

                    if (result_product.length === 0) {
                         return reply.code(400).send({ error: 'Feedback already given for this order' });
                    }

                    const feedbacksStmt = `
                         UPDATE Orders
                         SET have_feedback = true
                         WHERE user_id = ? 
                         AND order_id = ? 
                         AND have_feedback = false;
                    `;

                    await db(feedbacksStmt, [userInfo.id, order_id]);

                    const insertStmt = `
                         INSERT INTO Feedbacks (feedback_id, user_id, client_id, product_id, comment, stars, created_at)
                         VALUES (?, ?, ?, ?, ?, ?, NOW())
                    `;

                    const feedback_id = randomUUID();
                    await db(insertStmt, [feedback_id, result_product[0].seller_id, userInfo.id, result_product[0].product_id, comment, stars]);

                    try {
                         const rating = `
                              SELECT 
                                   AVG(stars) AS average_stars,
                                        CASE 
                                        WHEN AVG(stars) <= 4 THEN 18.3333 * AVG(stars) + 21.6667
                                        ELSE 5 * AVG(stars) + 75
                                   END AS percentage
                              FROM Feedbacks
                              WHERE user_id = ?;
                         `;
                         const result_rating = await db(rating, [seller_id]);
                         const rating_value = (Math.round(parseFloat(result_rating[0].percentage) * 100) / 100).toFixed(2);
                         console.log(rating_value);
                         const ratingUpdate = `
                              UPDATE Users
                              SET rate = ?
                              WHERE user_id = ?;
                         `;

                         await db(ratingUpdate, [rating_value, seller_id]);

                         try {
                              const is_category = `
                                   SELECT category FROM Products
                                   WHERE product_id = ?  AND deleted = 0;
                              `;

                              const resultCategory = await db(is_category, result_product[0].product_id);
                              const category = resultCategory[0].category;
                              let columnToUpdate;

                              if (category === 'Account') {
                                   columnToUpdate = 'accounts_selled';
                              } else if (category === 'Service') {
                                   columnToUpdate = 'services_selled';
                              } else if (category === 'Asset') {
                                   columnToUpdate = 'assets_selled';
                              }

                              const update_selled = `
                                   UPDATE Users
                                   SET ${columnToUpdate} = ${columnToUpdate} + 1
                                   WHERE user_id = ?
                              `;
                              await db(update_selled, [seller_id]);

                         } catch (err) {
                              console.log({ status: "CRITICAL", error: `Error updating selled from user... ${err}` });
                         }
                    } catch (err) {
                         console.log({ status: "CRITICAL", error: `Error modifying rate from user... ${err}` });
                    }

                    return reply.code(201).send({
                         message: 'Feedback created successfully',
                         feedback_id: feedback_id,
                    });
               } catch (error) {
                    console.error('DB error creating feedback:', error);
                    return reply.code(500).send({ error: 'Database error' });
               }
          },

          getRating: async (request, reply) => {
               const userInfo = request.userInfo;

               const rating = `
                    SELECT
                    AVG(stars) AS average_stars, 
                    (AVG(stars) * 20) AS percentage 
                    FROM Feedbacks 
                    WHERE user_id = ?;
               `;

               try {     
                    const result_rating = await db(rating, [userInfo.id]);
                    const rating_value = (Math.round(parseFloat(result_rating[0].percentage) * 100) / 100).toFixed(2);
                    return reply.send({ rating_value });
               } catch (err) {
                    console.error('Error fetching rating:', err);
                    return reply.code(500).send({ error: 'Error fetching rating' });
               }
          }
     };
}