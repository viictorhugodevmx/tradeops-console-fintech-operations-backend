import { Request, Response } from 'express';
import { TradeRequestModel } from '../trade-requests/trade-request.model';

export const getDashboardSummary = async (_req: Request, res: Response): Promise<Response> => {
  try {
    const [
      totalTradeRequests,
      pendingCount,
      assignedCount,
      inReviewCount,
      approvedCount,
      rejectedCount,
      compliancePendingCount,
      complianceApprovedCount,
      complianceRejectedCount,
      complianceNeedsInfoCount,
      totalAmountResult,
      recentTradeRequests,
    ] = await Promise.all([
      TradeRequestModel.countDocuments(),
      TradeRequestModel.countDocuments({ status: 'pending' }),
      TradeRequestModel.countDocuments({ status: 'assigned' }),
      TradeRequestModel.countDocuments({ status: 'in_review' }),
      TradeRequestModel.countDocuments({ status: 'approved' }),
      TradeRequestModel.countDocuments({ status: 'rejected' }),
      TradeRequestModel.countDocuments({ complianceStatus: 'pending' }),
      TradeRequestModel.countDocuments({ complianceStatus: 'approved' }),
      TradeRequestModel.countDocuments({ complianceStatus: 'rejected' }),
      TradeRequestModel.countDocuments({ complianceStatus: 'needs_info' }),
      TradeRequestModel.aggregate([
        {
          $group: {
            _id: null,
            totalAmount: { $sum: '$amount' },
          },
        },
      ]),
      TradeRequestModel.find()
        .populate('createdBy', 'name email role')
        .populate('assignedTo', 'name email role')
        .sort({ createdAt: -1 })
        .limit(5),
    ]);

    const totalAmount = totalAmountResult[0]?.totalAmount || 0;

    return res.status(200).json({
      success: true,
      message: 'Dashboard summary fetched successfully',
      data: {
        totals: {
          totalTradeRequests,
          totalAmount,
        },
        byStatus: {
          pending: pendingCount,
          assigned: assignedCount,
          in_review: inReviewCount,
          approved: approvedCount,
          rejected: rejectedCount,
        },
        byComplianceStatus: {
          pending: compliancePendingCount,
          approved: complianceApprovedCount,
          rejected: complianceRejectedCount,
          needs_info: complianceNeedsInfoCount,
        },
        recentTradeRequests,
      },
    });
  } catch (error) {
    console.error('Get dashboard summary error:', error);

    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};