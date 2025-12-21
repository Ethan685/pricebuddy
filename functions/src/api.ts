import express from 'express';
import cors from 'cors';
import { onRequest } from 'firebase-functions/v2/https';
import alertsRouter from './routes/alerts';
import appRouter from './routes/app';

const app = express();
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5174'
];

app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({
    ok: true,
    region: 'asia-northeast3',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV
  });
});

app.use(alertsRouter);
app.use(appRouter);

export const api = onRequest({ region: 'asia-northeast3' }, app);
