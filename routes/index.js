import { Router } from 'express';
import authRoutes from './auth.routes.js';
import vaultItemRoutes from './vaultItem.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/vault-items', vaultItemRoutes);

export default router;
