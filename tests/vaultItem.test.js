import { describe, it, expect } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../app.js';
import User from '../models/user.js';
import VaultItem from '../models/vaultItem.js';
import { createUserWithToken } from './factories/user.factory.js';
import { createVaultItem } from './factories/vaultItem.factory.js';

describe('Vault Item Routes', () => {
  // =====================
  // LIST
  // =====================
  describe('GET /api/vault-items', () => {
    it('deve retornar 401 quando não autenticado', async () => {
      const res = await request(app).get('/api/vault-items');
      expect(res.status).toBe(401);
      expect(res.body.error).toBe('Não autorizado');
    });

    it('deve retornar 403 se a conta estiver desativada', async () => {
      const { user, token } = await createUserWithToken();
      await User.findByIdAndUpdate(user._id, { active: false });

      const res = await request(app)
        .get('/api/vault-items')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(403);
      expect(res.body.error).toBe('Conta desativada.');
    });

    it('deve retornar 200 e lista vazia quando não houver itens', async () => {
      const { token } = await createUserWithToken();

      const res = await request(app)
        .get('/api/vault-items')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });

    it('deve retornar apenas os itens do usuário autenticado', async () => {
      const { user, token } = await createUserWithToken();
      const { user: other } = await createUserWithToken();

      await createVaultItem({ user: user._id, ciphertext: 'c1', nonce: 'n1' });
      await createVaultItem({ user: user._id, ciphertext: 'c2', nonce: 'n2' });
      await createVaultItem({ user: other._id, ciphertext: 'c-other', nonce: 'n-other' });

      const res = await request(app)
        .get('/api/vault-items')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(2);
      expect(res.body.every((i) => i.user === user._id.toString())).toBe(true);
    });
  });

  // =====================
  // CREATE
  // =====================
  describe('POST /api/vault-items', () => {
    it('deve retornar 401 quando não autenticado', async () => {
      const res = await request(app)
        .post('/api/vault-items')
        .send({ ciphertext: 'abc', nonce: 'xyz' });

      expect(res.status).toBe(401);
    });

    it('deve retornar 422 se faltar ciphertext', async () => {
      const { token } = await createUserWithToken();

      const res = await request(app)
        .post('/api/vault-items')
        .set('Authorization', `Bearer ${token}`)
        .send({ nonce: 'xyz' });

      expect(res.status).toBe(422);
      expect(res.body.error).toBe('Dados inválidos');
      expect(res.body.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: 'ciphertext',
            message: 'ciphertext é obrigatório',
          }),
        ])
      );
    });

    it('deve retornar 422 se faltar nonce', async () => {
      const { token } = await createUserWithToken();

      const res = await request(app)
        .post('/api/vault-items')
        .set('Authorization', `Bearer ${token}`)
        .send({ ciphertext: 'abc' });

      expect(res.status).toBe(422);
      expect(res.body.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: 'nonce',
            message: 'nonce é obrigatório',
          }),
        ])
      );
    });

    it('deve retornar 201 e criar o item cifrado', async () => {
      const { user, token } = await createUserWithToken();

      const res = await request(app)
        .post('/api/vault-items')
        .set('Authorization', `Bearer ${token}`)
        .send({
          ciphertext: 'encrypted-payload-base64',
          nonce: 'nonce-base64',
          version: 1,
        });

      expect(res.status).toBe(201);
      expect(res.body.ciphertext).toBe('encrypted-payload-base64');
      expect(res.body.nonce).toBe('nonce-base64');
      expect(res.body.user).toBe(user._id.toString());
      expect(res.body.version).toBe(1);

      const created = await VaultItem.findById(res.body._id);
      expect(created).toBeTruthy();
    });
  });

  // =====================
  // UPDATE
  // =====================
  describe('PATCH /api/vault-items/:id', () => {
    it('deve retornar 401 quando não autenticado', async () => {
      const res = await request(app)
        .patch(`/api/vault-items/${new mongoose.Types.ObjectId()}`)
        .send({ ciphertext: 'new' });

      expect(res.status).toBe(401);
    });

    it('deve retornar 404 quando o item não existir', async () => {
      const { token } = await createUserWithToken();
      const fakeId = new mongoose.Types.ObjectId();

      const res = await request(app)
        .patch(`/api/vault-items/${fakeId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ ciphertext: 'new-cipher' });

      expect(res.status).toBe(404);
      expect(res.body.error).toBe('Item não encontrado.');
    });

    it('deve retornar 403 quando o item for de outro usuário', async () => {
      const { token } = await createUserWithToken();
      const { user: other } = await createUserWithToken();
      const item = await createVaultItem({
        user: other._id,
        ciphertext: 'secret',
        nonce: 'n1',
      });

      const res = await request(app)
        .patch(`/api/vault-items/${item._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ ciphertext: 'hack' });

      expect(res.status).toBe(403);
      expect(res.body.error).toBe(
        'Você não tem permissão para editar este item.'
      );
    });

    it('deve retornar 200 e atualizar ciphertext e nonce', async () => {
      const { user, token } = await createUserWithToken();
      const item = await createVaultItem({
        user: user._id,
        ciphertext: 'old-c',
        nonce: 'old-n',
      });

      const res = await request(app)
        .patch(`/api/vault-items/${item._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ ciphertext: 'new-c', nonce: 'new-n' });

      expect(res.status).toBe(200);
      expect(res.body.ciphertext).toBe('new-c');
      expect(res.body.nonce).toBe('new-n');

      const updated = await VaultItem.findById(item._id);
      expect(updated.ciphertext).toBe('new-c');
      expect(updated.nonce).toBe('new-n');
    });
  });

  // =====================
  // DELETE
  // =====================
  describe('DELETE /api/vault-items/:id', () => {
    it('deve retornar 401 quando não autenticado', async () => {
      const res = await request(app).delete(
        `/api/vault-items/${new mongoose.Types.ObjectId()}`
      );
      expect(res.status).toBe(401);
    });

    it('deve retornar 404 quando o item não existir', async () => {
      const { token } = await createUserWithToken();
      const fakeId = new mongoose.Types.ObjectId();

      const res = await request(app)
        .delete(`/api/vault-items/${fakeId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(404);
      expect(res.body.error).toBe('Item não encontrado.');
    });

    it('deve retornar 403 quando o item for de outro usuário', async () => {
      const { token } = await createUserWithToken();
      const { user: other } = await createUserWithToken();
      const item = await createVaultItem({ user: other._id });

      const res = await request(app)
        .delete(`/api/vault-items/${item._id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(403);
      expect(res.body.error).toBe(
        'Você não tem permissão para excluir este item.'
      );

      const stillThere = await VaultItem.findById(item._id);
      expect(stillThere).toBeTruthy();
    });

    it('deve retornar 204 e excluir o item', async () => {
      const { user, token } = await createUserWithToken();
      const item = await createVaultItem({ user: user._id });

      const res = await request(app)
        .delete(`/api/vault-items/${item._id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(204);
      expect(res.body).toEqual({});

      const deleted = await VaultItem.findById(item._id);
      expect(deleted).toBeNull();
    });
  });
});
