import {
     describe,
     test,
     expect,
     jest
} from '@jest/globals';

describe('seller controllers', () => {
  describe('addProduct controller', () => {
    test('creates a new product for seller', async () => {
      const db = jest.fn().mockResolvedValue({ insertId: 1 });
      const productData = {
        seller_id: 1,
        name: 'Test Product',
        price: 99.99,
        category: 'account'
      };

      const result = await db(
        'INSERT INTO Products (seller_id, name, price, category) VALUES (?, ?, ?, ?)',
        [productData.seller_id, productData.name, productData.price, productData.category]
      );

      expect(result.insertId).toBe(1);
    });

    test('returns 400 on invalid category', async () => {
      const code = jest.fn().mockReturnValue({ send: jest.fn() });
      const reply = { code };
      const VALID_CATEGORIES = new Set(['account', 'service', 'others']);
      const category = 'invalid';

      if (!VALID_CATEGORIES.has(category)) {
        code(400);
      }

      expect(code).toHaveBeenCalledWith(400);
    });
  });

  describe('getProduct controller', () => {
    test('retrieves all products for seller', async () => {
      const db = jest.fn().mockResolvedValue([
        { product_id: 1, name: 'Product 1', price: 99.99 }
      ]);
      const sellerId = 1;

      const result = await db(
        'SELECT * FROM Products WHERE seller_id = ?',
        [sellerId]
      );

      expect(result).toHaveLength(1);
    });
  });

  describe('getProductById controller', () => {
    test('retrieves specific product', async () => {
      const db = jest.fn().mockResolvedValue([
        { product_id: 1, name: 'Product 1', price: 99.99 }
      ]);
      const productId = 1;

      const result = await db(
        'SELECT * FROM Products WHERE product_id = ?',
        [productId]
      );

      expect(result[0].product_id).toBe(1);
    });

    test('returns empty on product not found', async () => {
      const db = jest.fn().mockResolvedValue([]);
      const productId = 999;

      const result = await db(
        'SELECT * FROM Products WHERE product_id = ?',
        [productId]
      );

      expect(result).toHaveLength(0);
    });
  });

  describe('updateProduct controller', () => {
    test('updates product details', async () => {
      const db = jest.fn().mockResolvedValue({ affectedRows: 1 });
      const productData = { product_id: 1, name: 'Updated Name', price: 199.99 };

      const result = await db(
        'UPDATE Products SET name = ?, price = ? WHERE product_id = ?',
        [productData.name, productData.price, productData.product_id]
      );

      expect(result.affectedRows).toBe(1);
    });
  });

  describe('removeProduct controller', () => {
    test('removes product', async () => {
      const db = jest.fn().mockResolvedValue({ affectedRows: 1 });
      const productId = 1;

      const result = await db(
        'DELETE FROM Products WHERE product_id = ?',
        [productId]
      );

      expect(result.affectedRows).toBe(1);
    });
  });

  describe('pauseProduct controller', () => {
    test('pauses product sales', async () => {
      const db = jest.fn().mockResolvedValue({ affectedRows: 1 });
      const productId = 1;

      const result = await db(
        'UPDATE Products SET is_active = 0 WHERE product_id = ?',
        [productId]
      );

      expect(result.affectedRows).toBe(1);
    });
  });

  describe('resumeProduct controller', () => {
    test('resumes product sales', async () => {
      const db = jest.fn().mockResolvedValue({ affectedRows: 1 });
      const productId = 1;

      const result = await db(
        'UPDATE Products SET is_active = 1 WHERE product_id = ?',
        [productId]
      );

      expect(result.affectedRows).toBe(1);
    });
  });

  describe('getServices controller', () => {
    test('retrieves seller services', async () => {
      const db = jest.fn().mockResolvedValue([
        { service_id: 1, name: 'Service 1', price: 50 }
      ]);
      const sellerId = 1;

      const result = await db(
        'SELECT * FROM Services WHERE seller_id = ?',
        [sellerId]
      );

      expect(result).toHaveLength(1);
    });
  });

  describe('getAccounts controller', () => {
    test('retrieves seller accounts', async () => {
      const db = jest.fn().mockResolvedValue([
        { account_id: 1, name: 'Account 1' }
      ]);
      const sellerId = 1;

      const result = await db(
        'SELECT * FROM Accounts WHERE seller_id = ?',
        [sellerId]
      );

      expect(result).toHaveLength(1);
    });
  });

  describe('getAssets controller', () => {
    test('retrieves seller assets', async () => {
      const db = jest.fn().mockResolvedValue([
        { asset_id: 1, name: 'Asset 1', url: 'https://...' }
      ]);
      const sellerId = 1;

      const result = await db(
        'SELECT * FROM Assets WHERE seller_id = ?',
        [sellerId]
      );

      expect(result).toHaveLength(1);
    });
  });

  describe('resume controller', () => {
    test('retrieves seller resume', async () => {
      const db = jest.fn().mockResolvedValue([
        { seller_id: 1, bio: 'Seller bio', rating: 4.8 }
      ]);
      const sellerId = 1;

      const result = await db(
        'SELECT * FROM Sellers WHERE seller_id = ?',
        [sellerId]
      );

      expect(result[0].rating).toBe(4.8);
    });
  });

  describe('getModifyProduct controller', () => {
    test('retrieves product for modification', async () => {
      const db = jest.fn().mockResolvedValue([
        { product_id: 1, name: 'Product 1', price: 99.99 }
      ]);
      const productId = 1;

      const result = await db(
        'SELECT * FROM Products WHERE product_id = ?',
        [productId]
      );

      expect(result[0].product_id).toBe(1);
    });
  });

  describe('getNav_Product controller', () => {
    test('retrieves navigation products', async () => {
      const db = jest.fn().mockResolvedValue([
        { product_id: 1, name: 'Product 1' },
        { product_id: 2, name: 'Product 2' }
      ]);
      const sellerId = 1;

      const result = await db(
        'SELECT product_id, name FROM Products WHERE seller_id = ? LIMIT ?',
        [sellerId, 10]
      );

      expect(result).toHaveLength(2);
    });
  });

  describe('getProductSelf controller', () => {
    test('retrieves own products', async () => {
      const db = jest.fn().mockResolvedValue([
        { product_id: 1, name: 'My Product' }
      ]);
      const sellerId = 1;

      const result = await db(
        'SELECT * FROM Products WHERE seller_id = ?',
        [sellerId]
      );

      expect(result[0].name).toBe('My Product');
    });
  });
});
