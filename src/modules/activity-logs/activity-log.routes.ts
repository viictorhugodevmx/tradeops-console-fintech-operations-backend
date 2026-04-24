import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.middleware';
import { getTradeRequestActivity } from './activity-log.controller';

const router = Router();

router.get('/:id/activity', requireAuth, getTradeRequestActivity);

export default router;