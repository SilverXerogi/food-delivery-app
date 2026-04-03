import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import authRoutes from './routes/auth.routes';
import { setupSwagger } from './swagger/setup';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/auth', authRoutes);

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'OK', service: 'auth-service' });
});

setupSwagger(app);

export default app;
