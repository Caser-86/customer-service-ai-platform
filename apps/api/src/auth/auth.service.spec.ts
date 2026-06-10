import { describe, it, expect } from 'vitest';

describe('Auth', () => {
  it('should hash and verify password', () => {
    const bcrypt = require('bcryptjs');
    const password = 'password123';
    const hash = bcrypt.hashSync(password, 10);
    expect(bcrypt.compareSync(password, hash)).toBe(true);
    expect(bcrypt.compareSync('wrong', hash)).toBe(false);
  });

  it('should generate valid JWT', () => {
    const jwt = require('jsonwebtoken');
    const secret = 'test-secret';
    const payload = { sub: 'user-1', email: 'test@test.com', roles: ['admin'] };
    const token = jwt.sign(payload, secret, { expiresIn: '1h' });
    expect(token).toBeDefined();
    const decoded = jwt.verify(token, secret);
    expect(decoded.sub).toBe('user-1');
    expect(decoded.email).toBe('test@test.com');
  });
});
