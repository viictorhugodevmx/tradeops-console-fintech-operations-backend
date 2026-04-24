import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { ActivityLogModel } from './activity-log.model';
import { TradeRequestModel } from '../trade-requests/trade-request.model';

export const getTradeRequestActivity = async (req: Request, res: Response): Promise<Response> => {
  try {
    const rawId = req.params.id;
    const id = Array.isArray(rawId) ? rawId[0] : rawId;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid trade request id',
      });
    }

    const tradeRequest = await TradeRequestModel.findById(id);

    if (!tradeRequest) {
      return res.status(404).json({
        success: false,
        message: 'Trade request not found',
      });
    }

    const activity = await ActivityLogModel.find({ tradeRequestId: id })
      .populate('userId', 'name email role')
      .sort({ timestamp: -1, createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: 'Trade request activity fetched successfully',
      data: activity,
    });
  } catch (error) {
    console.error('Get trade request activity error:', error);

    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};