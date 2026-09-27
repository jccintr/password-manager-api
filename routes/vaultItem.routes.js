import { Router } from 'express';
import * as VaultItemController from '../controllers/vaultItem.controller.js';
import { validate } from '../middlewares/validate.js';
import Auth from '../middlewares/auth.js';
import {
  createVaultItemValidator,
  updateVaultItemValidator,
} from '../validators/vaultItem.validator.js';

const router = Router();

router.get('/', Auth, VaultItemController.listVaultItems);
router.post('/', Auth, createVaultItemValidator, validate, VaultItemController.createVaultItem);
router.patch('/:id', Auth, updateVaultItemValidator, validate, VaultItemController.updateVaultItem);
router.delete('/:id', Auth, VaultItemController.deleteVaultItem);

export default router;
