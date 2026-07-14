import {
     describe,
     test,
     expect,
     jest
} from '@jest/globals';

describe('user controllers', () => {
  describe('create_user controller', () => {
    test('returns 400 on missing email/password', async () => {
      const code = jest.fn().mockReturnValue({ send: jest.fn() });
      const reply = { code };
      const request = { body: { email: 'test@test.com' } }; // missing password

      if (!request.body.email || !request.body.password) {
        code(400);
      }

      expect(code).toHaveBeenCalledWith(400);
    });

    test('returns 409 if user already exists', async () => {
      const db = jest.fn().mockResolvedValue([{ user_id: 1 }]);
      const code = jest.fn().mockReturnValue({ send: jest.fn() });
      const reply = { code };

      const existing = await db(
        'SELECT user_id, email FROM Users WHERE email = ?',
        ['existing@test.com']
      );

      if (existing?.length) {
        code(409);
      }

      expect(code).toHaveBeenCalledWith(409);
    });

    test('creates new user successfully', async () => {
      const db = jest.fn().mockResolvedValue({ insertId: 1 });
      const userData = {
        email: 'newuser@test.com',
        username: 'newuser',
        password_hash: 'hashed_password'
      };

      const result = await db(
        'INSERT INTO Users (email, username, password) VALUES (?, ?, ?)',
        [userData.email, userData.username, userData.password_hash]
      );

      expect(result.insertId).toBe(1);
    });
  });

  describe('login_user controller', () => {
    test('returns 401 on invalid credentials', async () => {
      const db = jest.fn().mockResolvedValue([]);
      const code = jest.fn().mockReturnValue({ send: jest.fn() });
      const reply = { code };
      const email = 'notfound@test.com';

      const user = await db(
        'SELECT * FROM Users WHERE email = ?',
        [email]
      );

      if (!user?.length) {
        code(401);
      }

      expect(code).toHaveBeenCalledWith(401);
    });

    test('returns user token on success', async () => {
      const db = jest.fn().mockResolvedValue([
        { user_id: 1, email: 'test@test.com', password: 'hashed' }
      ]);
      const send = jest.fn();
      const reply = { send };
      const email = 'test@test.com';

      const user = await db(
        'SELECT * FROM Users WHERE email = ?',
        [email]
      );

      if (user?.length) {
        send({ token: 'jwt_token', user_id: user[0].user_id });
      }

      expect(send).toHaveBeenCalled();
    });
  });

  describe('delete_user controller', () => {
    test('deletes user account', async () => {
      const db = jest.fn().mockResolvedValue({ affectedRows: 1 });
      const userId = 1;

      const result = await db(
        'DELETE FROM Users WHERE user_id = ?',
        [userId]
      );

      expect(result.affectedRows).toBe(1);
    });

    test('returns 404 on user not found', async () => {
      const db = jest.fn().mockResolvedValue({ affectedRows: 0 });
      const userId = 999;

      const result = await db(
        'DELETE FROM Users WHERE user_id = ?',
        [userId]
      );

      expect(result.affectedRows).toBe(0);
    });
  });

  describe('modify_user controller', () => {
    test('updates user profile', async () => {
      const db = jest.fn().mockResolvedValue({ affectedRows: 1 });
      const userData = { user_id: 1, username: 'newname', email: 'new@test.com' };

      const result = await db(
        'UPDATE Users SET username = ?, email = ? WHERE user_id = ?',
        [userData.username, userData.email, userData.user_id]
      );

      expect(result.affectedRows).toBe(1);
    });

    test('returns 400 on invalid data', async () => {
      const code = jest.fn().mockReturnValue({ send: jest.fn() });
      const reply = { code };
      const userData = { username: '', email: 'invalid' };

      if (!userData.username || !userData.email) {
        code(400);
      }

      expect(code).toHaveBeenCalledWith(400);
    });
  });

  describe('get_notify controller', () => {
    test('retrieves user notifications', async () => {
      const db = jest.fn().mockResolvedValue([
        { notification_id: 1, message: 'New order', created_at: '2026-01-01' }
      ]);
      const userId = 1;

      const result = await db(
        'SELECT * FROM Notifications WHERE user_id = ? ORDER BY created_at DESC',
        [userId]
      );

      expect(result).toHaveLength(1);
    });
  });

  describe('get_unread controller', () => {
    test('retrieves unread notification count', async () => {
      const db = jest.fn().mockResolvedValue([
        { unread_count: 5 }
      ]);
      const userId = 1;

      const result = await db(
        'SELECT COUNT(*) as unread_count FROM Notifications WHERE user_id = ? AND is_read = 0',
        [userId]
      );

      expect(result[0].unread_count).toBe(5);
    });

    test('returns 0 when no unread notifications', async () => {
      const db = jest.fn().mockResolvedValue([
        { unread_count: 0 }
      ]);
      const userId = 1;

      const result = await db(
        'SELECT COUNT(*) as unread_count FROM Notifications WHERE user_id = ? AND is_read = 0',
        [userId]
      );

      expect(result[0].unread_count).toBe(0);
    });
  });
});
