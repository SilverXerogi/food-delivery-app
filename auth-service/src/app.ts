import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import authRoutes from './routes/auth.routes';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

// Поддерживаем оба префикса:
// - /api/auth/* для фронтенда через nginx
// - /auth/* для прямой отладки бэка на localhost:3001
app.use('/api/auth', authRoutes);
app.use('/auth', authRoutes);

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'OK', service: 'auth-service' });
});

export default app;
