import { Router } from 'express';
import auth from '../middleware/auth.js';
import { requireRole } from '../middleware/roles.js';
import { upgradeTenant, inviteUser } from '../controllers/tenantsController.js';

const router = Router();

router.post('/:tenantId/upgrade', auth, requireRole('admin'), upgradeTenant);
router.post('/:tenantId/invite', auth, requireRole('admin'), inviteUser);

export default router;
