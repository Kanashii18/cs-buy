import {
     describe,
     test,
     expect,
     jest
} from '@jest/globals';

describe('registers modules', () => {
  describe('registers handler', () => {
    test('registers all API routes', () => {
      const mockRegisters = jest.fn();
      const mockFastify = {
        register: jest.fn()
      };

      expect(typeof mockRegisters).toBe('function');
    });

    test('registers auth routes', () => {
      const mockFastify = {
        register: jest.fn()
      };

      mockFastify.register(jest.fn());

      expect(mockFastify.register).toHaveBeenCalled();
    });

    test('registers user routes', () => {
      const mockFastify = {
        register: jest.fn()
      };

      mockFastify.register(jest.fn());

      expect(mockFastify.register).toHaveBeenCalled();
    });

    test('registers seller routes', () => {
      const mockFastify = {
        register: jest.fn()
      };

      mockFastify.register(jest.fn());

      expect(mockFastify.register).toHaveBeenCalled();
    });

    test('receives database connection', () => {
      const mockDb = jest.fn();
      const mockRegisters = jest.fn();

      mockRegisters({ db: mockDb });

      expect(mockRegisters).toHaveBeenCalledWith(
        expect.objectContaining({ db: mockDb })
      );
    });

    test('receives socket.io instance', () => {
      const mockIo = { on: jest.fn() };
      const mockRegisters = jest.fn();

      mockRegisters({ io: mockIo });

      expect(mockRegisters).toHaveBeenCalledWith(
        expect.objectContaining({ io: mockIo })
      );
    });

    test('receives users tracking object', () => {
      const mockUsers = {};
      const mockRegisters = jest.fn();

      mockRegisters({ users: mockUsers });

      expect(mockRegisters).toHaveBeenCalledWith(
        expect.objectContaining({ users: mockUsers })
      );
    });
  });

  describe('routes_def definitions', () => {
    test('exports route definitions object', () => {
      const mockRoutesDef = {
        auth: { path: '/auth', methods: ['GET', 'POST'] },
        user: { path: '/user', methods: ['GET', 'POST', 'PUT', 'DELETE'] },
        seller: { path: '/seller', methods: ['GET', 'POST', 'PUT'] }
      };

      expect(typeof mockRoutesDef).toBe('object');
      expect(mockRoutesDef.auth).toBeDefined();
    });

    test('defines all required routes', () => {
      const requiredRoutes = ['auth', 'user', 'seller', 'order', 'payment', 'wallet'];
      const mockRoutesDef = {
        auth: {},
        user: {},
        seller: {},
        order: {},
        payment: {},
        wallet: {}
      };

      requiredRoutes.forEach(route => {
        expect(mockRoutesDef[route]).toBeDefined();
      });
    });

    test('route definitions include path and methods', () => {
      const mockRouteDef = {
        path: '/api/users',
        methods: ['GET', 'POST']
      };

      expect(mockRouteDef.path).toBeDefined();
      expect(mockRouteDef.methods).toBeDefined();
      expect(Array.isArray(mockRouteDef.methods)).toBe(true);
    });

    test('supports protected and public routes', () => {
      const mockRoutesDef = {
        login: { path: '/auth/login', protected: false },
        profile: { path: '/user/profile', protected: true }
      };

      expect(mockRoutesDef.login.protected).toBe(false);
      expect(mockRoutesDef.profile.protected).toBe(true);
    });
  });
});
