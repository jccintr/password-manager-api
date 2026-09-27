import bcryptjs from 'bcryptjs';
import jsonwebtoken from 'jsonwebtoken';
import User from '../../models/user.js';

/**
 * Cria um User no banco.
 * @param {object} overrides
 * @returns {Promise<import('mongoose').Document>}
 */
export async function createUser(overrides = {}) {
  const password = overrides.password || '123456';
  const hashedPassword = await bcryptjs.hash(password, 10);

  const user = await User.create({
    name: 'User Teste',
    email: `user${Date.now()}${Math.random().toString(36).slice(2, 6)}@test.com`,
    password: hashedPassword,
    kdfSalt: 'test-kdf-salt-base64',
    ...overrides,
    password: overrides.password
      ? await bcryptjs.hash(overrides.password, 10)
      : hashedPassword,
    kdfSalt: overrides.kdfSalt || 'test-kdf-salt-base64',
  });

  return user;
}

/**
 * Cria um User + token JWT.
 * @param {object} overrides
 * @returns {Promise<{ user: object, token: string }>}
 */
export async function createUserWithToken(overrides = {}) {
  const user = await createUser(overrides);

  const token = jsonwebtoken.sign(
    { userId: user._id },
    process.env.JWT_SECRET
  );

  return { user, token };
}
