import {
  describe,
  expect,
  jest,
  test,
  beforeEach,
  afterEach,
} from '@jest/globals';

const stripePaymentIntentsMock = {
  create: jest.fn(),
  retrieve: jest.fn(),
};

const orderServiceMock = jest.fn();
const orderAccountMock = jest.fn();
const finallyOrderMock = jest.fn();

jest.unstable_mockModule('dotenv', () => ({
  default: {
    config: jest.fn(),
  },
}));

jest.unstable_mockModule('stripe', () => ({
  default: jest.fn(() => ({
    paymentIntents: stripePaymentIntentsMock,
  })),
}));

jest.unstable_mockModule('paypal-rest-sdk', () => ({
  default: {
    configure: jest.fn(),
    payment: {
      create: jest.fn(),
      execute: jest.fn(),
    },
  },
}));

jest.unstable_mockModule('ecpair', () => ({
  ECPairFactory: jest.fn(() => ({
    makeRandom: jest.fn(() => ({
      publicKey: Buffer.from('mock-public-key'),
    })),
  })),
}));

jest.unstable_mockModule('bitcoinjs-lib', () => ({
  payments: {
    p2pkh: jest.fn(() => ({
      address: 'mock-litecoin-address',
    })),
  },
}));

jest.unstable_mockModule('tiny-secp256k1', () => ({}));

jest.unstable_mockModule('../payment_success/order.db/service.db.js', () => ({
  default: orderServiceMock,
}));

jest.unstable_mockModule('../payment_success/order.db/account.db.js', () => ({
  default: orderAccountMock,
}));

jest.unstable_mockModule('../payment_success/chat.notify.db.js', () => ({
  default: finallyOrderMock,
}));

const { payment_Controller } = await import('../payment.controller.js');

function createReplyMock() {
  return {
    code: jest.fn(function code(statusCode) {
      this.statusCode = statusCode;
      return this;
    }),

    send: jest.fn(function send(payload) {
      this.payload = payload;
      return this;
    }),
  };
}

function createRequestMock(overrides = {}) {
  return {
    body: {},
    product: {
      product_id: 'product-123',
      user_id: 'seller-456',
      price: '25.50',
      category: 'Service',
    },
    userInfo: {
      id: 'buyer-789',
    },
    ...overrides,
  };
}

function createControllerMock({ db = jest.fn(), io = {}, users = new Map() } = {}) {
  return payment_Controller(db, io, users);
}

describe('payment_Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('stripe_payment', () => {
    test('returns 400 when payment_method is missing', async () => {
      const controller = createControllerMock();
      const request = createRequestMock();
      const reply = createReplyMock();

      await controller.stripe_payment(request, reply);

      expect(reply.code).toHaveBeenCalledWith(400);
      expect(reply.send).toHaveBeenCalledWith({
        error: 'Payment method is required.',
      });
      expect(stripePaymentIntentsMock.create).not.toHaveBeenCalled();
    });

    test('creates a Stripe payment intent and returns payment data when capture is required', async () => {
      stripePaymentIntentsMock.create.mockResolvedValue({
        id: 'pi_123',
        client_secret: 'pi_123_secret_abc',
        status: 'requires_capture',
      });

      const controller = createControllerMock();
      const request = createRequestMock({
        body: {
          payment_method: 'pm_card_visa',
        },
      });
      const reply = createReplyMock();

      await controller.stripe_payment(request, reply);

      expect(stripePaymentIntentsMock.create).toHaveBeenCalledWith({
        amount: 2550,
        currency: 'usd',
        payment_method: 'pm_card_visa',
        confirmation_method: 'automatic',
        capture_method: 'manual',
        confirm: true,
        payment_method_types: ['card'],
        payment_method_options: {
          card: {
            request_three_d_secure: 'any',
          },
        },
        metadata: {
          product_id: 'product-123',
          user_id: 'buyer-789',
          seller_id: 'seller-456',
        },
      });

      expect(reply.code).toHaveBeenCalledWith(200);
      expect(reply.send).toHaveBeenCalledWith({
        id: 'pi_123_secret_abc',
        status: 'requires_capture',
        payment_id: 'pi_123',
      });
    });

    test('creates a Stripe payment intent and returns payment data when action is required', async () => {
      stripePaymentIntentsMock.create.mockResolvedValue({
        id: 'pi_requires_action',
        client_secret: 'pi_requires_action_secret',
        status: 'requires_action',
      });

      const controller = createControllerMock();
      const request = createRequestMock({
        body: {
          payment_method: 'pm_card_threeDSecure2Required',
        },
      });
      const reply = createReplyMock();

      await controller.stripe_payment(request, reply);

      expect(reply.code).toHaveBeenCalledWith(200);
      expect(reply.send).toHaveBeenCalledWith({
        id: 'pi_requires_action_secret',
        status: 'requires_action',
        payment_id: 'pi_requires_action',
      });
    });

    test('returns 500 when Stripe payment intent creation fails', async () => {
      const stripeError = new Error('Stripe unavailable');

      stripePaymentIntentsMock.create.mockRejectedValue(stripeError);

      const controller = createControllerMock();
      const request = createRequestMock({
        body: {
          payment_method: 'pm_card_visa',
        },
      });
      const reply = createReplyMock();

      await controller.stripe_payment(request, reply);

      expect(reply.code).toHaveBeenCalledWith(500);
      expect(reply.send).toHaveBeenCalledWith({
        error: stripeError,
      });
    });
  });

  describe('stripe_status', () => {
    test('returns 400 when payment status is not requires_capture', async () => {
      stripePaymentIntentsMock.retrieve.mockResolvedValue({
        id: 'pi_failed',
        status: 'requires_payment_method',
      });

      const db = jest.fn();
      const controller = createControllerMock({ db });
      const request = createRequestMock({
        body: {
          paymentIntentId: 'pi_failed',
        },
      });
      const reply = createReplyMock();

      await controller.stripe_status(request, reply);

      expect(stripePaymentIntentsMock.retrieve).toHaveBeenCalledWith('pi_failed');
      expect(db).not.toHaveBeenCalled();

      expect(reply.code).toHaveBeenCalledWith(400);
      expect(reply.send).toHaveBeenCalledWith({
        error: 'Pago fallido o incompleto.',
      });
    });

    test('returns 401 when payment was already processed', async () => {
      stripePaymentIntentsMock.retrieve.mockResolvedValue({
        id: 'pi_processed',
        status: 'requires_capture',
      });

      const db = jest.fn().mockResolvedValueOnce([
        {
          payment_processed: 1,
        },
      ]);

      const controller = createControllerMock({ db });
      const request = createRequestMock({
        body: {
          paymentIntentId: 'pi_processed',
        },
      });
      const reply = createReplyMock();

      await controller.stripe_status(request, reply);

      expect(db).toHaveBeenCalledWith(
        expect.stringContaining('SELECT payment_processed FROM Payments'),
        ['pi_processed'],
      );

      expect(reply.code).toHaveBeenCalledWith(401);
      expect(reply.send).toHaveBeenCalledWith({
        error: 'invalid payment id',
      });

      expect(orderServiceMock).not.toHaveBeenCalled();
      expect(orderAccountMock).not.toHaveBeenCalled();
      expect(finallyOrderMock).not.toHaveBeenCalled();
    });

    test('updates wallet, creates service order, sends final notification and stores payment', async () => {
      stripePaymentIntentsMock.retrieve.mockResolvedValue({
        id: 'pi_requires_capture',
        status: 'requires_capture',
      });

      const db = jest
        .fn()
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce({ affectedRows: 1 })
        .mockResolvedValueOnce({ insertId: 1 });

      const io = {
        emit: jest.fn(),
      };

      const users = new Map();
      const controller = createControllerMock({ db, io, users });

      const request = createRequestMock({
        body: {
          paymentIntentId: 'pi_requires_capture',
        },
      });

      const reply = createReplyMock();

      await controller.stripe_status(request, reply);

      expect(stripePaymentIntentsMock.retrieve).toHaveBeenCalledWith(
        'pi_requires_capture',
      );

      expect(db).toHaveBeenNthCalledWith(
        1,
        expect.stringContaining('SELECT payment_processed FROM Payments'),
        ['pi_requires_capture'],
      );

      expect(db).toHaveBeenNthCalledWith(
        2,
        expect.stringContaining('UPDATE Wallets'),
        ['25.50', 'seller-456'],
      );

      expect(orderServiceMock).toHaveBeenCalledWith(
        reply,
        db,
        request.product,
        request.userInfo,
        expect.any(String),
      );

      expect(finallyOrderMock).toHaveBeenCalledWith(
        reply,
        db,
        request.product,
        request.userInfo,
        io,
        users,
      );

      expect(db).toHaveBeenNthCalledWith(
        3,
        expect.stringContaining('INSERT INTO Payments'),
        [
          'pi_requires_capture',
          expect.any(String),
          'buyer-789',
          'stripe',
          expect.any(String),
          '25.50',
          'requires_capture',
          'seller-456',
        ],
      );

      expect(reply.code).toHaveBeenCalledWith(200);
      expect(reply.send).toHaveBeenCalledWith('OK');
    });

    test('creates account order when product category is Account', async () => {
      stripePaymentIntentsMock.retrieve.mockResolvedValue({
        id: 'pi_account',
        status: 'requires_capture',
      });

      const db = jest
        .fn()
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce({ affectedRows: 1 })
        .mockResolvedValueOnce({ insertId: 1 });

      const controller = createControllerMock({ db });

      const request = createRequestMock({
        body: {
          paymentIntentId: 'pi_account',
        },
        product: {
          product_id: 'product-123',
          user_id: 'seller-456',
          price: '10',
          category: 'Account',
        },
      });

      const reply = createReplyMock();

      await controller.stripe_status(request, reply);

      expect(orderAccountMock).toHaveBeenCalledWith(
        reply,
        db,
        request.product,
        request.userInfo,
        expect.any(String),
      );

      expect(orderServiceMock).not.toHaveBeenCalled();

      expect(reply.code).toHaveBeenCalledWith(200);
      expect(reply.send).toHaveBeenCalledWith('OK');
    });

    test('returns 400 when product category is invalid', async () => {
      stripePaymentIntentsMock.retrieve.mockResolvedValue({
        id: 'pi_invalid_category',
        status: 'requires_capture',
      });

      const db = jest
        .fn()
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce({ affectedRows: 1 });

      const controller = createControllerMock({ db });

      const request = createRequestMock({
        body: {
          paymentIntentId: 'pi_invalid_category',
        },
        product: {
          product_id: 'product-123',
          user_id: 'seller-456',
          price: '10',
          category: 'Unknown',
        },
      });

      const reply = createReplyMock();

      await controller.stripe_status(request, reply);

      expect(reply.code).toHaveBeenCalledWith(400);
      expect(reply.send).toHaveBeenCalledWith('invalid option');

      expect(orderServiceMock).not.toHaveBeenCalled();
      expect(orderAccountMock).not.toHaveBeenCalled();
      expect(finallyOrderMock).not.toHaveBeenCalled();
    });

    test('returns 500 when Stripe payment verification fails', async () => {
      stripePaymentIntentsMock.retrieve.mockRejectedValue(
        new Error('Stripe retrieve failed'),
      );

      const db = jest.fn();
      const controller = createControllerMock({ db });

      const request = createRequestMock({
        body: {
          paymentIntentId: 'pi_error',
        },
      });

      const reply = createReplyMock();

      await controller.stripe_status(request, reply);

      expect(reply.code).toHaveBeenCalledWith(500);
      expect(reply.send).toHaveBeenCalledWith({
        error: 'Error en el servidor al verificar el pago.',
      });
    });
  });
});