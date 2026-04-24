import { Schema, model, Document, Types } from 'mongoose';

export interface IActivityLog extends Document {
  tradeRequestId: Types.ObjectId;
  action: string;
  message: string;
  userId: Types.ObjectId;
  timestamp: Date;
  createdAt: Date;
  updatedAt: Date;
}

const activityLogSchema = new Schema<IActivityLog>(
  {
    tradeRequestId: {
      type: Schema.Types.ObjectId,
      ref: 'TradeRequest',
      required: true,
    },
    action: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    timestamp: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export const ActivityLogModel = model<IActivityLog>('ActivityLog', activityLogSchema);