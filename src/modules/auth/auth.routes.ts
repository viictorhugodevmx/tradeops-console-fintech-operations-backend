import { Router } from 'express';
import { getMe, login } from './auth.controller';
import { requireAuth } from '../../middleware/auth.middleware';

const router = Router();

router.post('/login', login);
router.get('/me', requireAuth, getMe);

export default router;