import express from 'express';
import cors from 'cors';
import path from 'path';
import { collectDefaultMetrics, register } from 'prom-client';
import { authRouter } from './auth/auth.router';
import { expensesRouter } from './expenses/expenses.router';
import { metricsMiddleware } from './middleware/metrics.middleware';

collectDefaultMetrics({ prefix: 'expensetracker_' });

export const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));
app.use(metricsMiddleware);

// ── Health check ───────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), uptime: process.uptime() });
});

// ── Prometheus metrics ─────────────────────────────────────
app.get('/metrics', async (_req, res) => {
  res.setHeader('Content-Type', register.contentType);
  res.send(await register.metrics());
});

// ── API routes ─────────────────────────────────────────────
app.use('/api/auth', authRouter);
app.use('/api/expenses', expensesRouter);

// ── Serve frontend for all other GET routes ─────────────────
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, '../public/index.html'));
  }
});
