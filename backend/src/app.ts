import express from 'express';
import cors from 'cors';
import path from 'path';
import { env } from './config/env';
import authRoutes from './modules/auth/auth.routes';
import profileRoutes from './modules/profile/profile.routes';
import { errorHandler } from './middleware/error.middleware';

const app = express();

app.use(cors({ origin: env.CORS_ORIGIN }));
app.use(express.json());

// Serve uploaded images statically
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Health Check Endpoint
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API v1 Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/profile', profileRoutes);

// Global Error Handler Middleware
app.use(errorHandler);

export default app;
