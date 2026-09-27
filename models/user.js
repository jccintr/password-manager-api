import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    // hash da senha de autenticação (NÃO é a chave do cofre)
    password: { type: String, required: true },
    active: { type: Boolean, default: true },
    // parâmetros públicos da KDF — o cliente usa junto com a senha mestra
    // para derivar a vaultKey (não são secretos)
    kdfSalt: { type: String, required: true },
    kdfParams: {
      algorithm: { type: String, default: 'argon2id' },
      iterations: { type: Number, default: 3 },
      memory: { type: Number, default: 65536 },
      parallelism: { type: Number, default: 1 },
    },
  },
  { timestamps: true }
);

const User = mongoose.model('User', userSchema);

export default User;
