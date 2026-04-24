import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { env } from '../../config/env';
import { UserModel } from '../users/user.model';
import { TradeRequestModel } from '../trade-requests/trade-request.model';
import { ActivityLogModel } from '../activity-logs/activity-log.model';

const runSeed = async (): Promise<void> => {
  try {
    await mongoose.connect(env.mongoUri);
    console.log('MongoDB connected for seed');

    await ActivityLogModel.deleteMany({});
    await TradeRequestModel.deleteMany({});
    await UserModel.deleteMany({});

    const passwordHash = await bcrypt.hash('123456', 10);

    const [admin, operator, compliance, viewer] = await UserModel.create([
      {
        name: 'Admin User',
        email: 'admin@tradeops.com',
        passwordHash,
        role: 'admin',
      },
      {
        name: 'Operator User',
        email: 'operator@tradeops.com',
        passwordHash,
        role: 'operator',
      },
      {
        name: 'Compliance User',
        email: 'compliance@tradeops.com',
        passwordHash,
        role: 'compliance',
      },
      {
        name: 'Viewer User',
        email: 'viewer@tradeops.com',
        passwordHash,
        role: 'viewer',
      },
    ]);

    const tradeRequests = await TradeRequestModel.create([
      {
        folio: 'TR-1001',
        clientName: 'Juan Perez',
        operationType: 'buy',
        instrument: 'CETES',
        amount: 150000,
        currency: 'MXN',
        status: 'pending',
        priority: 'high',
        assignedTo: operator._id,
        complianceStatus: 'pending',
        notes: 'Urgent request from premium client',
        createdBy: admin._id,
      },
      {
        folio: 'TR-1002',
        clientName: 'Maria Lopez',
        operationType: 'sell',
        instrument: 'BONOS',
        amount: 80000,
        currency: 'MXN',
        status: 'in_review',
        priority: 'medium',
        assignedTo: operator._id,
        complianceStatus: 'needs_info',
        notes: 'Missing supporting document',
        createdBy: admin._id,
      },
      {
        folio: 'TR-1003',
        clientName: 'Carlos Ramirez',
        operationType: 'transfer',
        instrument: 'USD',
        amount: 25000,
        currency: 'USD',
        status: 'approved',
        priority: 'low',
        assignedTo: operator._id,
        complianceStatus: 'approved',
        notes: 'Validated and approved',
        createdBy: admin._id,
      },
    ]);

    await ActivityLogModel.create([
      {
        tradeRequestId: tradeRequests[0]._id,
        action: 'created',
        message: 'Trade request created',
        userId: admin._id,
      },
      {
        tradeRequestId: tradeRequests[0]._id,
        action: 'assigned',
        message: 'Trade request assigned to operator',
        userId: admin._id,
      },
      {
        tradeRequestId: tradeRequests[1]._id,
        action: 'compliance_review',
        message: 'Compliance requested additional information',
        userId: compliance._id,
      },
      {
        tradeRequestId: tradeRequests[2]._id,
        action: 'approved',
        message: 'Trade request approved successfully',
        userId: compliance._id,
      },
    ]);

    console.log('Seed completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
};

runSeed();