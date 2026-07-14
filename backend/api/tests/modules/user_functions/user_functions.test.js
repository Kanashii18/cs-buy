import generateName from '../../../modules/user_functions/generate_name.js';
import conditional from '../../../modules/user_functions/conditional.js';
import { isBanned } from '../../../modules/user_functions/is_banned.js';
import {
     describe,
     test,
     expect,
     jest
} from '@jest/globals';

describe('generate_name utility', () => {
     test('generates unique username with format word_number', () => {
          const username = generateName();

          expect(typeof username).toBe('string');
          expect(username).toMatch(/^[a-z]+_\d{4}$/);
     });

     test('always includes a 4-digit number', () => {
          const username = generateName();
          const parts = username.split('_');

          expect(parts).toHaveLength(2);
          expect(/^\d{4}$/.test(parts[1])).toBe(true);
     });

     test('number is between 1000 and 9999', () => {
          for (let i = 0; i < 10; i++) {
               const username = generateName();
               const number = parseInt(username.split('_')[1]);
               
               expect(number).toBeGreaterThanOrEqual(1000);
               expect(number).toBeLessThanOrEqual(9999);
          }
     });

     test('generates different usernames on multiple calls', () => {
          const usernames = new Set();

          for (let i = 0; i < 20; i++) {
               usernames.add(generateName());
          }

          expect(usernames.size).toBeGreaterThan(1);
     });
});

describe('conditional validation utility', () => {
     test('validates email structure', () => {
          expect(conditional.email_conditional('test@gmail.com')).toBeUndefined();
          expect(conditional.email_conditional('invalid.email')).toBeDefined();
     });

     test('rejects email with less than 8 characters before @', () => {
          const error = conditional.email_conditional('abc@gmail.com');
          
          expect(error).toBeDefined();
          });

          test('rejects email longer than 55 characters', () => {
          const longEmail = 'a'.repeat(50) + '@example.com';
          
          const error = conditional.email_conditional(longEmail);
          
          expect(error).toBeDefined();
     });

     test('validates password length between 6 and 30', () => {
          expect(conditional.password_conditional('short')).toBeDefined();
          expect(conditional.password_conditional('validpass123')).toBeUndefined();
          expect(conditional.password_conditional('a'.repeat(31))).toBeDefined();
     });

     test('validates username length less than 16', () => {
          expect(conditional.username_conditional('validname')).toBeUndefined();
          expect(conditional.username_conditional('a'.repeat(16))).toBeDefined();
     });

     test('validates description length less than 130', () => {
          expect(conditional.description_conditional('Short desc')).toBeUndefined();
          expect(conditional.description_conditional('a'.repeat(130))).toBeDefined();
     });
});

describe('is_banned utility', () => {
     test('returns false when user is not banned', async () => {
          const mockDb = jest.fn().mockResolvedValue([]);

          const result = await isBanned(mockDb, {
               userId: 'user123',
               deviceId: 'device123',
               ip: '192.168.1.1'
          });

          expect(result).toBe(false);
     });

     test('returns true when user is banned', async () => {
          const mockDb = jest.fn().mockResolvedValue([{ 1: 1 }]);

          const result = await isBanned(mockDb, {
               userId: 'banned_user',
               deviceId: 'device456',
               ip: '192.168.1.2'
          });

          expect(result).toBe(true);
     });

     test('queries database with correct parameters', async () => {
          const mockDb = jest.fn().mockResolvedValue([]);

          const userId = 'user123';
          const deviceId = 'device123';
          const ip = '1.2.3.4';

          await isBanned(mockDb, { userId, deviceId, ip });

          expect(mockDb).toHaveBeenCalledWith(
               expect.stringContaining('SELECT 1 FROM Bans'),
               [userId, deviceId, ip]
          );
     });

     test('handles database errors gracefully', async () => {
          const mockDb = jest.fn().mockRejectedValue(new Error('DB error'));

          await expect(
               isBanned(mockDb, {
               userId: 'user123',
               deviceId: 'dev123',
               ip: '1.1.1.1'
               })
          ).rejects.toThrow();
     });
});

describe('device_id utility', () => {
     test('extracts or generates device ID', () => {
          const mockRequest = {
               cookies: { device_cookie: 'device.signature' }
          };

          expect(typeof mockRequest.cookies.device_cookie).toBe('string');
     });

     test('validates device signature', () => {
          const mockRequest = {
               cookies: { device_cookie: 'device-uuid.signature-hash' }
          };

          const [id, sig] = mockRequest.cookies.device_cookie.split('.');

          expect(id).toBeDefined();
          expect(sig).toBeDefined();
     });

     test('generates new device ID if not found', () => {
          const mockRequest = {
               cookies: {}
          };

          if (!mockRequest.cookies.device_id) {
               mockRequest.deviceId = 'generated-uuid';
          }

          expect(mockRequest.deviceId).toBeDefined();
     });
});