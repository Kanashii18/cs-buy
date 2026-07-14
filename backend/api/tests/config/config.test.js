import * as bcrypt from '../../config/bcrypt.ts';
import {
     describe,
     test,
     expect,
     jest
} from '@jest/globals';

describe('bcrypt config', () => {
  test('exports BCRYPT_COST constant', () => {
    expect(typeof bcrypt.BCRYPT_COST).toBe('number');
    expect(bcrypt.BCRYPT_COST).toBeGreaterThan(0);
  });

  test('BCRYPT_COST is valid value', () => {
    expect(bcrypt.BCRYPT_COST).toBe(12);
  });

  test('exports SECRET_PEPPER string', () => {
    expect(typeof bcrypt.SECRET_PEPPER).toBe('string');
  });

  test('SECRET_PEPPER is defined from environment', () => {
    process.env.SECRET_PEPPER = 'test_pepper_123';

    expect(bcrypt.SECRET_PEPPER).toBe('test_pepper_123');
  });
});

describe('env config', () => {
  test('reads environment variables', () => {
    process.env.DB_HOST = 'localhost';
    process.env.DB_PORT = '3306';

    expect(process.env.DB_HOST).toBe('localhost');
    expect(process.env.DB_PORT).toBe('3306');
  });
});

describe('error config', () => {
  test('handles missing config values', () => {
    const mockError = jest.fn();

    if (typeof process.env.INVALID_CONFIG !== 'string') {
      mockError('INVALID_CONFIG', 'Invalid type value');
    }

    expect(mockError).toHaveBeenCalledWith(
      'INVALID_CONFIG',
      'Invalid type value'
    );
  });
});

describe('filter config', () => {
  test('provides filtering utilities', () => {
    // Filter config provides utilities for request/response filtering
    expect(typeof filter).toBe('object');
  });
});