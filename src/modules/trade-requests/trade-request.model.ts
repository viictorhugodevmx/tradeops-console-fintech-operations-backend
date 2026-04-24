import { Schema, model, Document, Types } from 'mongoose';

export type OperationType = 'buy' | 'sell' | 'transfer';
export type TradeRequestStatus = 'pending' | 'assigned' | 'in_review' | 'approved' | 'rejected';
export type TradeRequestPriority = 'low' | 'medium' | 'high';
export type ComplianceStatus = 'pending' | 'approved' | 'rejected' | 'needs_info';

export interface ITradeRequest extends Document {
  folio: string;
  clientName: string;
  operationType: OperationType;
  instrument: string;
  amount: number;
  currency: string;
  status: TradeRequestStatus;
  priority: TradeRequestPriority;
  assignedTo?: Types.ObjectId | null;
  complianceStatus: ComplianceStatus;
  notes?: string;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const tradeRequestSchema = new Schema<ITradeRequest>(
  {
    folio: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    clientName: {
      type: String,
      required: true,
      trim: true,
    },
    operationType: {
      type: String,
      enum: ['buy', 'sell', 'transfer'],
      required: true,
    },
    instrument: {
      type: String,
      required: true,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    status: {
      type: String,
      enum: ['pending', 'assigned', 'in_review', 'approved', 'rejected'],
      required: true,
      default: 'pending',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      required: true,
      default: 'medium',
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    complianceStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'needs_info'],
      required: true,
      default: 'pending',
    },
    notes: {
      type: String,
      default: '',
      trim: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const TradeRequestModel = model<ITradeRequest>('TradeRequest', tradeRequestSchema);