import express from 'express';
import cors from 'cors';
import path from 'path';
import { env } from './config/env';
import authRoutes from './modules/auth/auth.routes';
import profileRoutes from './modules/profile/profile.routes';
import matchesRoutes from './modules/matches/matches.routes';
import ratingsRoutes from './modules/ratings/ratings.routes';
import teamsRoutes from './modules/teams/teams.routes';
import canchasRoutes from './modules/canchas/canchas.routes';
import reservasRoutes from './modules/reservas/reservas.routes';
import subscriptionRoutes from './modules/subscription/subscription.routes';
import tournamentsRoutes from './modules/tournaments/tournaments.routes';
import statsRoutes from './modules/stats/stats.routes';
import notificationsRoutes from './modules/notifications/notifications.routes';
import settingsRoutes from './modules/settings/settings.routes';
import supportRoutes from './modules/support/support.routes';
import challengesRoutes from './modules/challenges/challenges.routes';
import adminRoutes from './modules/admin/admin.routes';
import discoveryRoutes from './modules/discovery/discovery.routes';
import socialRoutes from './modules/social/social.routes';
import favoritesRoutes from './modules/favorites/favorites.routes';
import calendarRoutes from './modules/calendar/calendar.routes';
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
app.use('/api/v1/matches', matchesRoutes);
app.use('/api/v1/ratings', ratingsRoutes);
app.use('/api/v1/teams', teamsRoutes);
app.use('/api/v1/canchas', canchasRoutes);
app.use('/api/v1/reservas', reservasRoutes);
app.use('/api/v1/subscription', subscriptionRoutes);
app.use('/api/v1/tournaments', tournamentsRoutes);
app.use('/api/v1/stats', statsRoutes);
app.use('/api/v1/notifications', notificationsRoutes);
app.use('/api/v1/settings', settingsRoutes);
app.use('/api/v1/support', supportRoutes);
app.use('/api/v1/challenges', challengesRoutes);
app.use('/api/v1/admin/center', adminRoutes);
app.use('/api/v1/discovery', discoveryRoutes);
app.use('/api/v1/social', socialRoutes);
app.use('/api/v1/favorites', favoritesRoutes);
app.use('/api/v1/calendar', calendarRoutes);

// Global Error Handler Middleware
app.use(errorHandler);

export default app;
