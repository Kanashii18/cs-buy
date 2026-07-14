import {
  describe,
  test,
  expect,
  jest
} from '@jest/globals';

test('returns 500 on database error', async () => {
     const controller = (
          await import(
               '../../../../../routes/controllers/chat/messages/controllers/postChat.controller.js'
          )
     ).default;

     const consoleErrorSpy = jest
          .spyOn(console, 'error')
          .mockImplementation(() => {});

     const db = jest
          .fn()
          .mockRejectedValue(new Error('DB error'));

     const code = jest.fn().mockReturnValue({
          send: jest.fn()
     });

     const reply = {
          code
     };

     const request = {
          body: {
               roomId: '123',
               recibe_id: '456',
               message: 'Hello'
          },
          userInfo: 1
     };

     await controller({
          db,
          request,
          reply
     });

     expect(code).toHaveBeenCalledWith(500);
     expect(consoleErrorSpy).toHaveBeenCalled();

     consoleErrorSpy.mockRestore();
});