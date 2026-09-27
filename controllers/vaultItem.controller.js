import VaultItem from '../models/vaultItem.js';
import User from '../models/user.js';

export const listVaultItems = async (req, res) => {
  try {
    const userId = req.user?.id || req.body.userId;

    const user = await User.findById(userId).select('active');

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    if (!user.active) {
      return res.status(403).json({ error: 'Conta desativada.' });
    }

    const items = await VaultItem.find({ user: userId }).sort({ createdAt: -1 });

    return res.status(200).json(items);
  } catch (error) {
    console.error('Erro no listVaultItems:', error);
    return res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

export const createVaultItem = async (req, res) => {
  try {
    const userId = req.user?.id || req.body.userId;

    const user = await User.findById(userId).select('active');

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    if (!user.active) {
      return res.status(403).json({ error: 'Conta desativada.' });
    }

    const { ciphertext, nonce, version } = req.body;

    const item = await VaultItem.create({
      user: userId,
      ciphertext,
      nonce,
      ...(version !== undefined ? { version } : {}),
    });

    return res.status(201).json(item);
  } catch (error) {
    console.error('Erro no createVaultItem:', error);
    return res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

export const updateVaultItem = async (req, res) => {
  try {
    const userId = req.user?.id || req.body.userId;
    const { id } = req.params;
    const { ciphertext, nonce, version } = req.body;

    const user = await User.findById(userId).select('active');

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    if (!user.active) {
      return res.status(403).json({ error: 'Conta desativada.' });
    }

    const item = await VaultItem.findById(id);

    if (!item) {
      return res.status(404).json({ error: 'Item não encontrado.' });
    }

    if (item.user.toString() !== userId.toString()) {
      return res.status(403).json({
        error: 'Você não tem permissão para editar este item.',
      });
    }

    if (ciphertext !== undefined) item.ciphertext = ciphertext;
    if (nonce !== undefined) item.nonce = nonce;
    if (version !== undefined) item.version = version;

    const updated = await item.save();

    return res.status(200).json(updated);
  } catch (error) {
    console.error('Erro no updateVaultItem:', error);
    return res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

export const deleteVaultItem = async (req, res) => {
  try {
    const userId = req.user?.id || req.body.userId;
    const { id } = req.params;

    const user = await User.findById(userId).select('active');

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    if (!user.active) {
      return res.status(403).json({ error: 'Conta desativada.' });
    }

    const item = await VaultItem.findById(id);

    if (!item) {
      return res.status(404).json({ error: 'Item não encontrado.' });
    }

    if (item.user.toString() !== userId.toString()) {
      return res.status(403).json({
        error: 'Você não tem permissão para excluir este item.',
      });
    }

    await item.deleteOne();

    return res.status(204).send();
  } catch (error) {
    console.error('Erro no deleteVaultItem:', error);
    return res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};
