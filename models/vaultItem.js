import mongoose from 'mongoose';

const vaultItemSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    // blob cifrado no cliente (AES-256-GCM): título, username, senha, url, notes...
    ciphertext: { type: String, required: true },
    nonce: { type: String, required: true },
    version: { type: Number, default: 1 },
  },
  { timestamps: true }
);

vaultItemSchema.index({ user: 1, createdAt: -1 });

const VaultItem = mongoose.model('VaultItem', vaultItemSchema);

export default VaultItem;
