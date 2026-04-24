import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { TradeRequestModel } from './trade-request.model';
import { ActivityLogModel } from '../activity-logs/activity-log.model';
import { generateTradeFolio } from '../../utils/generate-trade-folio';
import { UserModel } from '../users/user.model';

const allowedStatusTransitions: Record<string, string[]> = {
  pending: ['assigned', 'in_review'],
  assigned: ['in_review'],
  in_review: ['approved', 'rejected'],
  approved: [],
  rejected: [],
};

export const getTradeRequests = async (_req: Request, res: Response): Promise<Response> => {
  try {
    const tradeRequests = await TradeRequestModel.find()
      .populate('createdBy', 'name email role')
      .populate('assignedTo', 'name email role')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: 'Trade requests fetched successfully',
      data: tradeRequests,
    });
  } catch (error) {
    console.error('Get trade requests error:', error);

    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

export const getTradeRequestById = async (req: Request, res: Response): Promise<Response> => {
  try {
    const rawId = req.params.id;
    const id = Array.isArray(rawId) ? rawId[0] : rawId;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid trade request id',
      });
    }

    const tradeRequest = await TradeRequestModel.findById(id)
      .populate('createdBy', 'name email role')
      .populate('assignedTo', 'name email role');

    if (!tradeRequest) {
      return res.status(404).json({
        success: false,
        message: 'Trade request not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Trade request fetched successfully',
      data: tradeRequest,
    });
  } catch (error) {
    console.error('Get trade request by id error:', error);

    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

export const createTradeRequest = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { clientName, operationType, instrument, amount, currency, priority, notes } = req.body as {
      clientName?: string;
      operationType?: string;
      instrument?: string;
      amount?: number;
      currency?: string;
      priority?: string;
      notes?: string;
    };

    if (!req.user?.sub) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    if (!clientName || !operationType || !instrument || amount === undefined || !currency) {
      return res.status(400).json({
        success: false,
        message: 'clientName, operationType, instrument, amount and currency are required',
      });
    }

    if (!['buy', 'sell', 'transfer'].includes(operationType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid operationType. Allowed values: buy, sell, transfer',
      });
    }

    if (priority && !['low', 'medium', 'high'].includes(priority)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid priority. Allowed values: low, medium, high',
      });
    }

    if (typeof amount !== 'number' || Number.isNaN(amount) || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'amount must be a number greater than 0',
      });
    }

    const normalizedCurrency = currency.trim().toUpperCase();
    const folio = generateTradeFolio();

    const tradeRequest = await TradeRequestModel.create({
      folio,
      clientName: clientName.trim(),
      operationType,
      instrument: instrument.trim(),
      amount,
      currency: normalizedCurrency,
      status: 'pending',
      priority: priority || 'medium',
      assignedTo: null,
      complianceStatus: 'pending',
      notes: notes?.trim() || '',
      createdBy: req.user.sub,
    });

    await ActivityLogModel.create({
      tradeRequestId: tradeRequest._id,
      action: 'created',
      message: `Trade request ${folio} created`,
      userId: req.user.sub,
    });

    const populatedTradeRequest = await TradeRequestModel.findById(tradeRequest._id)
      .populate('createdBy', 'name email role')
      .populate('assignedTo', 'name email role');

    return res.status(201).json({
      success: true,
      message: 'Trade request created successfully',
      data: populatedTradeRequest,
    });
  } catch (error) {
    console.error('Create trade request error:', error);

    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

export const updateTradeRequest = async (req: Request, res: Response): Promise<Response> => {
  try {
    const rawId = req.params.id;
    const id = Array.isArray(rawId) ? rawId[0] : rawId;

    if (!req.user?.sub) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

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

    const {
      clientName,
      operationType,
      instrument,
      amount,
      currency,
      priority,
      notes,
      folio,
      status,
      assignedTo,
      complianceStatus,
      createdBy,
    } = req.body as {
      clientName?: string;
      operationType?: string;
      instrument?: string;
      amount?: number;
      currency?: string;
      priority?: string;
      notes?: string;
      folio?: string;
      status?: string;
      assignedTo?: string | null;
      complianceStatus?: string;
      createdBy?: string;
    };

    if (
      folio !== undefined ||
      status !== undefined ||
      assignedTo !== undefined ||
      complianceStatus !== undefined ||
      createdBy !== undefined
    ) {
      return res.status(400).json({
        success: false,
        message: 'folio, status, assignedTo, complianceStatus and createdBy cannot be edited here',
      });
    }

    if (clientName !== undefined) {
      if (!clientName.trim()) {
        return res.status(400).json({
          success: false,
          message: 'clientName cannot be empty',
        });
      }

      tradeRequest.clientName = clientName.trim();
    }

    if (operationType !== undefined) {
      if (!['buy', 'sell', 'transfer'].includes(operationType)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid operationType. Allowed values: buy, sell, transfer',
        });
      }

      tradeRequest.operationType = operationType as 'buy' | 'sell' | 'transfer';
    }

    if (instrument !== undefined) {
      if (!instrument.trim()) {
        return res.status(400).json({
          success: false,
          message: 'instrument cannot be empty',
        });
      }

      tradeRequest.instrument = instrument.trim();
    }

    if (amount !== undefined) {
      if (typeof amount !== 'number' || Number.isNaN(amount) || amount <= 0) {
        return res.status(400).json({
          success: false,
          message: 'amount must be a number greater than 0',
        });
      }

      tradeRequest.amount = amount;
    }

    if (currency !== undefined) {
      if (!currency.trim()) {
        return res.status(400).json({
          success: false,
          message: 'currency cannot be empty',
        });
      }

      tradeRequest.currency = currency.trim().toUpperCase();
    }

    if (priority !== undefined) {
      if (!['low', 'medium', 'high'].includes(priority)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid priority. Allowed values: low, medium, high',
        });
      }

      tradeRequest.priority = priority as 'low' | 'medium' | 'high';
    }

    if (notes !== undefined) {
      tradeRequest.notes = notes.trim();
    }

    await tradeRequest.save();

    await ActivityLogModel.create({
      tradeRequestId: tradeRequest._id,
      action: 'updated',
      message: `Trade request ${tradeRequest.folio} updated`,
      userId: req.user.sub,
    });

    const populatedTradeRequest = await TradeRequestModel.findById(tradeRequest._id)
      .populate('createdBy', 'name email role')
      .populate('assignedTo', 'name email role');

    return res.status(200).json({
      success: true,
      message: 'Trade request updated successfully',
      data: populatedTradeRequest,
    });
  } catch (error) {
    console.error('Update trade request error:', error);

    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

export const updateTradeRequestStatus = async (req: Request, res: Response): Promise<Response> => {
  try {
    const rawId = req.params.id;
    const id = Array.isArray(rawId) ? rawId[0] : rawId;
    const { status } = req.body as { status?: string };

    if (!req.user?.sub) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid trade request id',
      });
    }

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'status is required',
      });
    }

    if (!['pending', 'assigned', 'in_review', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Allowed values: pending, assigned, in_review, approved, rejected',
      });
    }

    const tradeRequest = await TradeRequestModel.findById(id);

    if (!tradeRequest) {
      return res.status(404).json({
        success: false,
        message: 'Trade request not found',
      });
    }

    const currentStatus = tradeRequest.status;
    const nextAllowedStatuses = allowedStatusTransitions[currentStatus] || [];

    if (!nextAllowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status transition from ${currentStatus} to ${status}`,
      });
    }

    tradeRequest.status = status as 'pending' | 'assigned' | 'in_review' | 'approved' | 'rejected';
    await tradeRequest.save();

    await ActivityLogModel.create({
      tradeRequestId: tradeRequest._id,
      action: 'status_changed',
      message: `Trade request ${tradeRequest.folio} status changed from ${currentStatus} to ${status}`,
      userId: req.user.sub,
    });

    const populatedTradeRequest = await TradeRequestModel.findById(tradeRequest._id)
      .populate('createdBy', 'name email role')
      .populate('assignedTo', 'name email role');

    return res.status(200).json({
      success: true,
      message: 'Trade request status updated successfully',
      data: populatedTradeRequest,
    });
  } catch (error) {
    console.error('Update trade request status error:', error);

    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

export const assignTradeRequest = async (req: Request, res: Response): Promise<Response> => {
  try {
    const rawId = req.params.id;
    const id = Array.isArray(rawId) ? rawId[0] : rawId;
    const { assignedTo } = req.body as { assignedTo?: string };

    if (!req.user?.sub) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid trade request id',
      });
    }

    if (!assignedTo) {
      return res.status(400).json({
        success: false,
        message: 'assignedTo is required',
      });
    }

    if (!mongoose.Types.ObjectId.isValid(assignedTo)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid assignedTo user id',
      });
    }

    const tradeRequest = await TradeRequestModel.findById(id);

    if (!tradeRequest) {
      return res.status(404).json({
        success: false,
        message: 'Trade request not found',
      });
    }

    if (['approved', 'rejected'].includes(tradeRequest.status)) {
      return res.status(400).json({
        success: false,
        message: `Trade request in status ${tradeRequest.status} cannot be assigned`,
      });
    }

    const operatorUser = await UserModel.findById(assignedTo);

    if (!operatorUser) {
      return res.status(404).json({
        success: false,
        message: 'Assigned user not found',
      });
    }

    if (operatorUser.role !== 'operator') {
      return res.status(400).json({
        success: false,
        message: 'Only users with role operator can be assigned',
      });
    }

    const previousAssignedTo = tradeRequest.assignedTo ? String(tradeRequest.assignedTo) : null;

    tradeRequest.assignedTo = operatorUser._id;

    if (tradeRequest.status === 'pending') {
      tradeRequest.status = 'assigned';
    }

    await tradeRequest.save();

    const assignmentMessage =
      previousAssignedTo && previousAssignedTo !== String(operatorUser._id)
        ? `Trade request ${tradeRequest.folio} reassigned to ${operatorUser.name}`
        : `Trade request ${tradeRequest.folio} assigned to ${operatorUser.name}`;

    await ActivityLogModel.create({
      tradeRequestId: tradeRequest._id,
      action: 'assigned',
      message: assignmentMessage,
      userId: req.user.sub,
    });

    const populatedTradeRequest = await TradeRequestModel.findById(tradeRequest._id)
      .populate('createdBy', 'name email role')
      .populate('assignedTo', 'name email role');

    return res.status(200).json({
      success: true,
      message: 'Trade request assigned successfully',
      data: populatedTradeRequest,
    });
  } catch (error) {
    console.error('Assign trade request error:', error);

    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

export const reviewTradeRequestCompliance = async (req: Request, res: Response): Promise<Response> => {
  try {
    const rawId = req.params.id;
    const id = Array.isArray(rawId) ? rawId[0] : rawId;
    const { complianceStatus, notes } = req.body as { complianceStatus?: string; notes?: string };

    if (!req.user?.sub) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid trade request id',
      });
    }

    if (!complianceStatus) {
      return res.status(400).json({
        success: false,
        message: 'complianceStatus is required',
      });
    }

    if (!['approved', 'rejected', 'needs_info'].includes(complianceStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid complianceStatus. Allowed values: approved, rejected, needs_info',
      });
    }

    const tradeRequest = await TradeRequestModel.findById(id);

    if (!tradeRequest) {
      return res.status(404).json({
        success: false,
        message: 'Trade request not found',
      });
    }

    if (tradeRequest.status !== 'in_review') {
      return res.status(400).json({
        success: false,
        message: `Trade request in status ${tradeRequest.status} cannot be reviewed by compliance`,
      });
    }

    tradeRequest.complianceStatus = complianceStatus as 'approved' | 'rejected' | 'needs_info';

    if (notes !== undefined) {
      tradeRequest.notes = notes.trim();
    }

    if (complianceStatus === 'approved') {
      tradeRequest.status = 'approved';
    }

    if (complianceStatus === 'rejected') {
      tradeRequest.status = 'rejected';
    }

    if (complianceStatus === 'needs_info') {
      tradeRequest.status = 'in_review';
    }

    await tradeRequest.save();

    await ActivityLogModel.create({
      tradeRequestId: tradeRequest._id,
      action: 'compliance_review',
      message: `Trade request ${tradeRequest.folio} compliance reviewed with result ${complianceStatus}`,
      userId: req.user.sub,
    });

    const populatedTradeRequest = await TradeRequestModel.findById(tradeRequest._id)
      .populate('createdBy', 'name email role')
      .populate('assignedTo', 'name email role');

    return res.status(200).json({
      success: true,
      message: 'Trade request compliance reviewed successfully',
      data: populatedTradeRequest,
    });
  } catch (error) {
    console.error('Review trade request compliance error:', error);

    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};