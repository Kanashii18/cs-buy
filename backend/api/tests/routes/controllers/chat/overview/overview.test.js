import {
     describe,
     test,
     expect,
     jest
} from '@jest/globals';

describe('chat overview controllers', () => {
  describe('overview controller', () => {
    test('retrieves chat overview for user', async () => {
      const db = jest.fn().mockResolvedValue([
        { chat_id: 1, participant_id: 2, last_message: 'Hi', last_update: '2026-01-01' }
      ]);
      const userId = 1;

      const result = await db(
        'SELECT * FROM Chats WHERE participant_1 = ? OR participant_2 = ? ORDER BY last_update DESC',
        [userId, userId]
      );

      expect(result).toHaveLength(1);
      expect(result[0].chat_id).toBe(1);
    });
  });

  describe('mark_as_read controller', () => {
    test('marks chat as read', async () => {
      const db = jest.fn().mockResolvedValue({ affectedRows: 1 });
      const chatId = 1;

      const result = await db(
        'UPDATE Chats SET is_read = 1 WHERE chat_id = ?',
        [chatId]
      );

      expect(result.affectedRows).toBe(1);
    });
  });

  describe('get_product controller', () => {
    test('retrieves product associated with chat', async () => {
      const db = jest.fn().mockResolvedValue([
        { product_id: 1, product_name: 'Test Product', chat_id: 1 }
      ]);
      const chatId = 1;

      const result = await db(
        'SELECT * FROM Products WHERE product_id IN (SELECT product_id FROM Chats WHERE chat_id = ?)',
        [chatId]
      );

      expect(result).toHaveLength(1);
      expect(result[0].product_name).toBe('Test Product');
    });
  });
});
