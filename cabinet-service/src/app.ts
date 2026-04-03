import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cabinetRoutes from './routes/cabinet.routes';
import { setupSwagger } from './swagger/setup';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use('/api/cabinet', cabinetRoutes);
app.use('/cabinet', cabinetRoutes);

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'OK', service: 'cabinet-service' });
});

setupSwagger(app);

export default app;
