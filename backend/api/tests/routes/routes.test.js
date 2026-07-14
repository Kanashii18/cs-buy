import {
  describe,
  test,
  expect,
  jest
} from '@jest/globals';

import authRouter from '../../routes/auth.routes.js';
import chatRouter from '../../routes/chat.routes.js';
import orderRouter from '../../routes/order.routes.js';
import purchaseRouter from '../../routes/purchase.routes.js';
import sellerRouter from '../../routes/seller.routes.js';
import userRouter from '../../routes/user.routes.js';
import walletRouter from '../../routes/wallet.routes.js';

describe('auth routes', () => {
  test('defines auth router function', () => {
    expect(typeof authRouter).toBe('function');
  });

  test('returns async fastify router function', () => {
    const mockDb = jest.fn();
    const mockCi = jest.fn();

    const router = authRouter(mockDb, mockCi);

    expect(typeof router).toBe('function');
  });

  test('registers routes with fastify instance', async () => {
    const mockFastify = {
      get: jest.fn(),
      post: jest.fn(),

      register: jest.fn(async (callback, options) => {
        await callback(mockFastify, options);
      })
    };

    const mockDb = jest.fn();
    const mockCi = jest.fn();

    const router = authRouter(mockDb, mockCi);

    await router(mockFastify);

    expect(mockFastify.get).toHaveBeenCalled();
    expect(mockFastify.post).toHaveBeenCalled();
  });
});

describe('chat routes', () => {
  test('defines chat router function', () => {
    expect(typeof chatRouter).toBe('function');
  });
});

describe('order routes', () => {
  test('defines order router function', () => {
    expect(typeof orderRouter).toBe('function');
  });
});

describe('purchase routes', () => {
  test('defines purchase router function', () => {
    expect(typeof purchaseRouter).toBe('function');
  });
});

describe('seller routes', () => {
  test('defines seller router function', () => {
    expect(typeof sellerRouter).toBe('function');
  });
});

describe('user routes', () => {
  test('defines user router function', () => {
    expect(typeof userRouter).toBe('function');
  });
});

describe('wallet routes', () => {
  test('defines wallet router function', () => {
    expect(typeof walletRouter).toBe('function');
  });
});