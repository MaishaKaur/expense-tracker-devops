import { hashPassword, verifyPassword, generateToken, verifyToken } from '../../src/auth/auth.service';

describe('Auth Service – pure functions', () => {

  describe('hashPassword', () => {
    it('hashes a password (not plaintext)', async () => {
      const hash = await hashPassword('Secret123');
      expect(hash).not.toBe('Secret123');
      expect(hash).toMatch(/^\$2[aby]\$/);
    });

    it('produces a different hash each time (salted)', async () => {
      const h1 = await hashPassword('Secret123');
      const h2 = await hashPassword('Secret123');
      expect(h1).not.toBe(h2);
    });
  });

  describe('verifyPassword', () => {
    it('returns true for correct password', async () => {
      const hash = await hashPassword('CorrectPass');
      expect(await verifyPassword('CorrectPass', hash)).toBe(true);
    });

    it('returns false for wrong password', async () => {
      const hash = await hashPassword('CorrectPass');
      expect(await verifyPassword('WrongPass', hash)).toBe(false);
    });
  });

  describe('generateToken / verifyToken', () => {
    it('generates a 3-part JWT', () => {
      const token = generateToken(42, 'user@test.com');
      expect(token.split('.')).toHaveLength(3);
    });

    it('round-trips the payload correctly', () => {
      const token = generateToken(42, 'user@test.com');
      const payload = verifyToken(token);
      expect(payload.userId).toBe(42);
      expect(payload.email).toBe('user@test.com');
    });

    it('throws on a tampered token', () => {
      expect(() => verifyToken('bad.token.value')).toThrow();
    });
  });
});
