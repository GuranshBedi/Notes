import { Router } from 'express';
import { verifyJWT , requireMember , requireAdmin} from '../middlewares/auth.js';
import { requireRole } from '../middlewares/role.js';
import { upgradeTenant, inviteUser } from '../controllers/tenant.controller.js';

const router = Router();

router.post('/:tenantId/upgrade', verifyJWT, requireAdmin, upgradeTenant);
router.post('/:tenantId/invite', verifyJWT, requireAdmin, inviteUser);

export default router;
