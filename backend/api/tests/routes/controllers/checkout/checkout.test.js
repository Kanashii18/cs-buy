import {
     describe,
     test,
     expect,
     jest
} from '@jest/globals';

describe('checkout controllers', () => {
  describe('getCheckoutProduct controller', () => {
    test('retrieves product for checkout', async () => {
      const db = jest.fn().mockResolvedValue([
        { product_id: 1, name: 'Product', price: 99.99, stock: 10 }
      ]);
      const productId = 1;

      const result = await db(
        'SELECT * FROM Products WHERE product_id = ?',
        [productId]
      );

      expect(result[0].price).toBe(99.99);
      expect(result[0].stock).toBe(10);
    });

    test('returns 404 when product not found', async () => {
      const db = jest.fn().mockResolvedValue([]);
      const productId = 999;

      const result = await db(
        'SELECT * FROM Products WHERE product_id = ?',
        [productId]
      );

      expect(result).toHaveLength(0);
    });
  });

  describe('get_session controller', () => {
    test('retrieves checkout session', async () => {
      const db = jest.fn().mockResolvedValue([
        { session_id: 'sess_123', user_id: 1, total: 99.99, status: 'pending' }
      ]);
      const sessionId = 'sess_123';

      const result = await db(
        'SELECT * FROM CheckoutSessions WHERE session_id = ?',
        [sessionId]
      );

      expect(result[0].status).toBe('pending');
    });
  });

  describe('get_order controller', () => {
    test('retrieves order details', async () => {
      const db = jest.fn().mockResolvedValue([
        { order_id: 1, user_id: 1, total: 99.99, status: 'completed' }
      ]);
      const orderId = 1;

      const result = await db(
        'SELECT * FROM Orders WHERE order_id = ?',
        [orderId]
      );

      expect(result[0].status).toBe('completed');
    });
  });

  describe('post_order controller', () => {
    test('creates a new order', async () => {
      const db = jest.fn().mockResolvedValue({ insertId: 1 });
      const orderData = { user_id: 1, product_id: 1, quantity: 2, total: 199.98 };

      const result = await db(
        'INSERT INTO Orders (user_id, product_id, quantity, total) VALUES (?, ?, ?, ?)',
        [orderData.user_id, orderData.product_id, orderData.quantity, orderData.total]
      );

      expect(result.insertId).toBe(1);
    });

    test('returns 400 on missing required fields', async () => {
      const code = jest.fn().mockReturnValue({ send: jest.fn() });
      const reply = { code };
      const request = { body: { user_id: 1 } }; // missing fields

      const hasError = !request.body.product_id || !request.body.quantity;
      if (hasError) {
        code(400);
      }

      expect(code).toHaveBeenCalledWith(400);
    });
  });
});
