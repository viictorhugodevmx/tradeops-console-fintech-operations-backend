import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import authRoutes from './modules/auth/auth.routes';
import tradeRequestRoutes from './modules/trade-requests/trade-request.routes';
import activityLogRoutes from './modules/activity-logs/activity-log.routes';
import dashboardRoutes from './modules/dashboard/dashboard.routes';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  return res.status(200).json({
    success: true,
    message: 'TradeOps Console API is running',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/trade-requests', tradeRequestRoutes);
app.use('/api/trade-requests', activityLogRoutes);
app.use('/api/dashboard', dashboardRoutes);

export default app;