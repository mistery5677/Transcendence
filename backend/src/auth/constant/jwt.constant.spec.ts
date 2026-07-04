import { getJwtSecret } from './jwt.constant';

describe('getJwtSecret', () => {
  const ORIGINAL = process.env.JWT_SECRET;

  afterEach(() => {
    if (ORIGINAL === undefined) {
      delete process.env.JWT_SECRET;
    } else {
      process.env.JWT_SECRET = ORIGINAL;
    }
  });

  it('returns the exact value of process.env.JWT_SECRET when it is a non-empty string', () => {
    process.env.JWT_SECRET = 'a-strong-secret-value';
    expect(getJwtSecret()).toBe('a-strong-secret-value');
  });

  it('throws when JWT_SECRET is undefined', () => {
    delete process.env.JWT_SECRET;
    expect(() => getJwtSecret()).toThrow();
  });

  it('throws when JWT_SECRET is an empty string', () => {
    process.env.JWT_SECRET = '';
    expect(() => getJwtSecret()).toThrow();
  });

  it('throws when JWT_SECRET is whitespace-only', () => {
    process.env.JWT_SECRET = '   ';
    expect(() => getJwtSecret()).toThrow();
  });

  it('throws an error whose message names JWT_SECRET and does not include a secret value', () => {
    process.env.JWT_SECRET = '';
    expect(() => getJwtSecret()).toThrow(/JWT_SECRET/);
  });
});
