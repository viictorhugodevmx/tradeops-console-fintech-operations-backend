import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.middleware';
import {
  assignTradeRequest,
  createTradeRequest,
  getTradeRequestById,
  getTradeRequests,
  reviewTradeRequestCompliance,
  updateTradeRequest,
  updateTradeRequestStatus,
} from './trade-request.controller';

const router = Router();

router.get('/', requireAuth, getTradeRequests);
router.get('/:id', requireAuth, getTradeRequestById);
router.post('/', requireAuth, createTradeRequest);
router.patch('/:id', requireAuth, updateTradeRequest);
router.patch('/:id/status', requireAuth, updateTradeRequestStatus);
router.patch('/:id/assign', requireAuth, assignTradeRequest);
router.patch('/:id/compliance', requireAuth, reviewTradeRequestCompliance);

export default router;