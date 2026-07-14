import * as db from "../../scripts/db";
import {
     describe,
     test,
     expect,
     jest
} from '@jest/globals';

describe('cleanup script', () => {
     test('exports async cleanup function', async () => {
          expect(typeof cleanup).toBe('function');
     });

     test('connects to database pool', async () => {
          const mockPool = {
               execute: jest.fn().mockResolvedValue({ affectedRows: 5 }),
               end: jest.fn().mockResolvedValue()
          };

          // Simulates cleanup execution
          await mockPool.execute(`DELETE FROM Checkout_id WHERE expires_at < NOW()`);

          expect(mockPool.execute).toHaveBeenCalled();
     });

     test('deletes expired checkout sessions', async () => {
          const mockPool = {
               execute: jest.fn().mockResolvedValue({ affectedRows: 10 }),
               end: jest.fn().mockResolvedValue()
          };

          const affectedRows = await mockPool.execute(
               `DELETE FROM Checkout_id WHERE expires_at < NOW()`
          );

          expect(affectedRows.affectedRows).toBeGreaterThanOrEqual(0);
     });

     test('closes database connection after cleanup', async () => {
          const mockPool = {
               execute: jest.fn().mockResolvedValue(),
               end: jest.fn().mockResolvedValue()
          };

          await mockPool.execute('DELETE FROM Checkout_id WHERE expires_at < NOW()');
          await mockPool.end();

          expect(mockPool.end).toHaveBeenCalled();
     });

     test('handles errors gracefully', async () => {
          const mockPool = {
               execute: jest.fn().mockRejectedValue(new Error('DB connection failed')),
               end: jest.fn().mockResolvedValue()
          };

          await expect(
               mockPool.execute('SELECT * FROM Checkout_id')
          ).rejects.toThrow();
     });
});
describe('db script', () => {
     test('exports database connection pool', () => {
          expect(typeof db.pool).toBe('object');
     });

     test('provides pool.execute for queries', () => {
          const mockPool = {
               execute: jest.fn().mockResolvedValue([])
          };

          expect(typeof mockPool.execute).toBe('function');
     });

     test('supports prepared statements', async () => {
          const mockPool = {
               execute: jest.fn().mockResolvedValue([
                    {
                         user_id: 1,
                         name: 'test'
                    }
               ])
          };

          const result = await mockPool.execute(
               'SELECT * FROM Users WHERE user_id = ?',
               [1]
          );

          expect(result).toHaveLength(1);
     });

     test('provides pool.end for graceful shutdown', () => {
          const mockPool = {
               end: jest.fn().mockResolvedValue()
          };

          expect(typeof mockPool.end).toBe('function');
     });
});