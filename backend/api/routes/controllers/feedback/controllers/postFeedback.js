import { randomUUID } from 'crypto';

export async function postFeedback({ request, reply, db }) {
  const userInfo = request.userInfo;
  const { order_id, comment, stars } = request.body;

  if (typeof order_id !== 'string' || typeof comment !== 'string' || stars == null || stars == 0) {
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
    const seller_id = result_product[0]?.seller_id;

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

      const ratingUpdate = `
        UPDATE Users
        SET rate = ?
        WHERE user_id = ?;
      `;

      await db(ratingUpdate, [rating_value, seller_id]);

      try {
        const is_category = `
          SELECT category FROM Products
          WHERE product_id = ? AND deleted = 0;
        `;

        const resultCategory = await db(is_category, [result_product[0].product_id]);
        const category = resultCategory[0]?.category;
        let columnToUpdate;

        if (category === 'Account') {
          columnToUpdate = 'accounts_selled';
        } else if (category === 'Service') {
          columnToUpdate = 'services_selled';
        } else if (category === 'Asset') {
          columnToUpdate = 'assets_selled';
        }

        if (columnToUpdate) {
          const update_selled = `
            UPDATE Users
            SET ${columnToUpdate} = ${columnToUpdate} + 1
            WHERE user_id = ?
          `;
          await db(update_selled, [seller_id]);
        }
      } catch (err) {
        console.log({ status: 'CRITICAL', error: `Error updating selled from user... ${err}` });
      }
    } catch (err) {
      console.log({ status: 'CRITICAL', error: `Error modifying rate from user... ${err}` });
    }

    return reply.code(201).send({
      message: 'Feedback created successfully',
      feedback_id: feedback_id
    });
  } catch (error) {
    console.error('DB error creating feedback:', error);
    return reply.code(500).send({ error: 'Database error' });
  }
}
