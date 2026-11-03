import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import summariesRouter from './routes/summaries.routes.js';
import historyRouter from './routes/history.routes.js';
import { errorMiddleware } from './middleware/error.middleware.js';

export const app = express();
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }));
app.use(express.json({ limit: '20kb' }));
app.use(rateLimit({ windowMs: 60_000, limit: 60, standardHeaders: true, legacyHeaders: false }));
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/summaries', summariesRouter);
app.use('/api/history', historyRouter);
app.use((req, res) => res.status(404).json({ error: 'Route not found.' }));
app.use(errorMiddleware);