import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.middleware';
import { getUsers } from './user.controller';

const router = Router();

router.get('/', requireAuth, getUsers);

export default router;