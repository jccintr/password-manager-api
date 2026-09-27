import VaultItem from '../../models/vaultItem.js';
import { createUser } from './user.factory.js';

/**
 * Cria um VaultItem no banco.
 * Se não passar `user`, cria um User automaticamente.
 * @param {object} overrides
 * @returns {Promise<import('mongoose').Document>}
 */
export async function createVaultItem(overrides = {}) {
  let userId = overrides.user;

  if (!userId) {
    const user = await createUser();
    userId = user._id;
  }

  const item = await VaultItem.create({
    user: userId,
    ciphertext: 'cipher-test-blob-base64',
    nonce: 'nonce-test-base64',
    version: 1,
    ...overrides,
    user: userId,
  });

  return item;
}
