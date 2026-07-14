import {
     describe,
     test,
     expect,
     jest
} from '@jest/globals';

describe('auth logout controller', () => {
  test('clears session cookie and returns 200', async () => {
    const controller = (await import('../../../../routes/controllers/auth/logout.js')).default;
    const clearCookie = jest.fn();
    const status = jest.fn().mockReturnValue({ send: jest.fn() });
    const reply = { clearCookie, status };

    controller(reply);

    expect(clearCookie).toHaveBeenCalledWith('session_token', {
      httpOnly: true,
      secure: false,
      sameSite: 'Strict',
      path: '/'
    });
    expect(status).toHaveBeenCalledWith(200);
  });

  test('sends correct logout message', async () => {
    const controller = (await import('../../../../routes/controllers/auth/logout.js')).default;
    const send = jest.fn();
    const reply = { 
      clearCookie: jest.fn(),
      status: jest.fn().mockReturnValue({ send })
    };

    controller(reply);

    expect(send).toHaveBeenCalledWith({ message: 'Sesión cerrada correctamente...' });
  });
});
