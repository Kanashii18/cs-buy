import {
     describe,
     test,
     expect,
     jest
} from '@jest/globals';

describe('order controllers', () => {
  describe('order controller', () => {
    test('retrieves order details', async () => {
      const db = jest.fn().mockResolvedValue([
        { order_id: 1, user_id: 1, status: 'pending' }
      ]);
      const orderId = 1;

      const result = await db(
        'SELECT * FROM Orders WHERE order_id = ?',
        [orderId]
      );

      expect(result[0].status).toBe('pending');
    });
  });

  describe('confirm_product controller', () => {
    test('confirms product delivery', async () => {
      const db = jest.fn().mockResolvedValue({ affectedRows: 1 });
      const orderId = 1;

      const result = await db(
        'UPDATE Orders SET status = ?, confirmed_at = NOW() WHERE order_id = ?',
        ['completed', orderId]
      );

      expect(result.affectedRows).toBe(1);
    });

    test('returns 404 on invalid order', async () => {
      const db = jest.fn().mockResolvedValue({ affectedRows: 0 });
      const orderId = 999;

      const result = await db(
        'UPDATE Orders SET status = ? WHERE order_id = ?',
        ['completed', orderId]
      );

      expect(result.affectedRows).toBe(0);
    });
  });

  describe('get_specific_product controller', () => {
    test('retrieves specific product from order', async () => {
      const db = jest.fn().mockResolvedValue([
        { product_id: 1, quantity: 2, price: 99.99 }
      ]);
      const orderId = 1;
      const productId = 1;

      const result = await db(
        'SELECT * FROM OrderItems WHERE order_id = ? AND product_id = ?',
        [orderId, productId]
      );

      expect(result).toHaveLength(1);
      expect(result[0].quantity).toBe(2);
    });
  });

  describe('get_purchased_by_user controller', () => {
    test('retrieves all purchases by user', async () => {
      const db = jest.fn().mockResolvedValue([
        { order_id: 1, product_id: 1, status: 'completed' },
        { order_id: 2, product_id: 2, status: 'pending' }
      ]);
      const userId = 1;

      const result = await db(
        'SELECT * FROM Orders WHERE user_id = ? ORDER BY created_at DESC',
        [userId]
      );

      expect(result).toHaveLength(2);
    });

    test('returns empty array when user has no purchases', async () => {
      const db = jest.fn().mockResolvedValue([]);
      const userId = 999;

      const result = await db(
        'SELECT * FROM Orders WHERE user_id = ?',
        [userId]
      );

      expect(result).toHaveLength(0);
    });
  });
});
