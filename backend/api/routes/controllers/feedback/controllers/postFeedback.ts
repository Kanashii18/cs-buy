import { randomUUID } from 'crypto';
import type { Feedback } from '../../../../types/feedback/index.type.ts';
import type { PostFeedback } from '../../../../types/feedback/db.type.ts';
import type { ResultSetHeader } from 'mysql2';

export async function postFeedback({ request, reply, db } : Feedback.Params<Feedback.Body.PostBody>) : Promise<void> {
	const userInfo = request.userInfo;
	const { order_id, comment, stars } = request.body;

	if (typeof order_id !== 'string' || typeof comment !== 'string' || stars == null || stars == 0) {
		return reply.code(400).send({ error: 'Missing required fields' });
	}

	try {
		const result_product = await db<PostFeedback[]>(`
			SELECT product_id, seller_id
			FROM Orders
			WHERE user_id = ? 
			AND order_id = ?
			AND have_feedback = false;
		`, [userInfo.id, order_id]);
		const seller_id = result_product[0]?.seller_id;

		if (result_product.length === 0) {
			return await reply.code(400).send({ error: 'Feedback already given for this order' });
		}

		await db<ResultSetHeader>(`
			UPDATE Orders
			SET have_feedback = true
			WHERE user_id = ? 
			AND order_id = ? 
			AND have_feedback = false;
		`, [userInfo.id, order_id]);

		const feedback_id = randomUUID();
		await db<ResultSetHeader>(`
			INSERT INTO Feedbacks (feedback_id, user_id, client_id, product_id, comment, stars, created_at)
			VALUES (?, ?, ?, ?, ?, ?, NOW())
		`, [feedback_id, result_product[0].seller_id, userInfo.id, result_product[0].product_id, comment, stars]);

		try {
			const result_rating = await db(`
				SELECT 
					AVG(stars) AS average_stars,
					CASE 
					WHEN AVG(stars) <= 4 THEN 18.3333 * AVG(stars) + 21.6667
					ELSE 5 * AVG(stars) + 75
					END AS percentage
				FROM Feedbacks
				WHERE user_id = ?;
			`, [seller_id]);
			const rating_value = (Math.round(parseFloat(result_rating[0].percentage) * 100) / 100).toFixed(2);

			await db(`
				UPDATE Users
				SET rate = ?
				WHERE user_id = ?;
			`, [rating_value, seller_id]);

			try {
				const resultCategory = await db(`
					SELECT category FROM Products
					WHERE product_id = ? AND deleted = 0;
				`, [result_product[0].product_id]);
				const category = resultCategory[0]?.category;
				let columnToUpdate : string;

				if (category === 'Account') {
					columnToUpdate = 'accounts_selled';
				} else if (category === 'Service') {
					columnToUpdate = 'services_selled';
				} else if (category === 'Asset') {
					columnToUpdate = 'assets_selled';
				} else{
					return await reply.code(400).send({ error: 'Unknown product category' });
				}

				if (columnToUpdate) {
					await db(`
						UPDATE Users
						SET ${columnToUpdate} = ${columnToUpdate} + 1
						WHERE user_id = ?
					`, [seller_id]);
				}
			} catch (err) {
				console.log({ status: 'CRITICAL', error: `Error updating selled from user... ${err}` });
				return await reply.code(500).send({ error: 'Server error' });
			}
		} catch (err) {
			console.log({ status: 'CRITICAL', error: `Error modifying rate from user... ${err}` });
			return await reply.code(500).send({ error: 'Server error' });
		}
		return await reply.code(201).send({
			message: 'Feedback created successfully',
			feedback_id: feedback_id
		});
	} catch (error) {
		console.error('DB error creating feedback:', error);
		return await reply.code(500).send({ error: 'Database error' });
	}
}
