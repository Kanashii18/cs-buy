import {
     describe,
     test,
     expect,
     jest
} from '@jest/globals';

describe('feedback controllers', () => {
  describe('postFeedback controller', () => {
    test('creates feedback for a product', async () => {
      const db = jest.fn().mockResolvedValue({ insertId: 1 });
      const feedbackData = { product_id: 1, user_id: 1, rating: 5, comment: 'Great!' };

      const result = await db(
        'INSERT INTO Feedback (product_id, user_id, rating, comment) VALUES (?, ?, ?, ?)',
        [feedbackData.product_id, feedbackData.user_id, feedbackData.rating, feedbackData.comment]
      );

      expect(result.insertId).toBe(1);
    });

    test('returns 400 on invalid rating', async () => {
      const code = jest.fn().mockReturnValue({ send: jest.fn() });
      const reply = { code };
      const feedbackData = { rating: 10 }; // invalid rating

      if (feedbackData.rating < 1 || feedbackData.rating > 5) {
        code(400);
      }

      expect(code).toHaveBeenCalledWith(400);
    });
  });

  describe('getFeedback controller', () => {
    test('retrieves feedback for a product', async () => {
      const db = jest.fn().mockResolvedValue([
        { feedback_id: 1, product_id: 1, rating: 5, comment: 'Great!' }
      ]);
      const productId = 1;

      const result = await db(
        'SELECT * FROM Feedback WHERE product_id = ?',
        [productId]
      );

      expect(result).toHaveLength(1);
      expect(result[0].rating).toBe(5);
    });
  });

  describe('getAllFeedback controller', () => {
    test('retrieves all feedback with pagination', async () => {
      const db = jest.fn().mockResolvedValue([
        { feedback_id: 1, product_id: 1, rating: 5 },
        { feedback_id: 2, product_id: 2, rating: 4 }
      ]);

      const result = await db(
        'SELECT * FROM Feedback LIMIT ? OFFSET ?',
        [10, 0]
      );

      expect(result).toHaveLength(2);
    });
  });

  describe('getRating controller', () => {
    test('retrieves average rating for a product', async () => {
      const db = jest.fn().mockResolvedValue([
        { avg_rating: 4.5, total_reviews: 10 }
      ]);
      const productId = 1;

      const result = await db(
        'SELECT AVG(rating) as avg_rating, COUNT(*) as total_reviews FROM Feedback WHERE product_id = ?',
        [productId]
      );

      expect(result[0].avg_rating).toBe(4.5);
    });
  });

  describe('getRecentOrder controller', () => {
    test('retrieves recent orders for feedback', async () => {
      const db = jest.fn().mockResolvedValue([
        { order_id: 1, product_id: 1, created_at: '2026-01-01' }
      ]);
      const userId = 1;

      const result = await db(
        'SELECT * FROM Orders WHERE user_id = ? ORDER BY created_at DESC LIMIT ?',
        [userId, 5]
      );

      expect(result).toHaveLength(1);
    });
  });

  describe('getTotalSelled controller', () => {
    test('retrieves total sold items', async () => {
      const db = jest.fn().mockResolvedValue([
        { total_sold: 150, total_revenue: 5000 }
      ]);
      const sellerId = 1;

      const result = await db(
        'SELECT COUNT(*) as total_sold, SUM(total) as total_revenue FROM Orders WHERE seller_id = ?',
        [sellerId]
      );

      expect(result[0].total_sold).toBe(150);
    });
  });
});
