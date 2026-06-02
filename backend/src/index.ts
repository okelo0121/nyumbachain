import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { connectDB, sequelize } from './config/db.config';
import './models';
import authRoutes from './routes/auth.routes';
import propertyRoutes from './routes/property.routes';
import { applicationRouter, tenancyRouter } from './routes/tenancy.routes';
import { startPaymentCron } from './jobs/payment.cron';

const app = express();
const PORT = process.env.PORT || 5000;

// ── Security Middleware ─────────────────────────────────────────────────────
app.use(helmet());                      // HSTS, X-Frame-Options, CSP headers
app.use(cookieParser());

// CORS: allow only frontend origin
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,                 // Required for HttpOnly cookies
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// ── Body Parsing ────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Rate Limiting (doc: 100 req/15min general, 10 req/15min auth) ───────────
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please try again later.' },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many authentication attempts. Please try again later.' },
});

app.use('/api', generalLimiter);
app.use('/api/auth', authLimiter);

// ── Routes ──────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/applications', applicationRouter);
app.use('/api/tenancies', tenancyRouter);

// ── Health Check ────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'NyumbaChain API',
    version: '1.0.0',
  });
});

// ── Global Error Handler ────────────────────────────────────────────────────
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
});

// ── 404 Handler ─────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found.' });
});

// ── Bootstrap ───────────────────────────────────────────────────────────────
const bootstrap = async () => {
  // Connect to Supabase PostgreSQL
  await connectDB();

  // Sync models — ALTER to be safe (never force: true in production)
  await sequelize.sync({ alter: process.env.NODE_ENV === 'development' });
  console.log('Database models synchronized.');

  // Start payment cron job
  startPaymentCron();

  app.listen(PORT, () => {
    console.log(`NyumbaChain API running on http://localhost:${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });
};

bootstrap().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
