import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import productsRoutes from './routes/products.routes';
import { setupSwagger } from './swagger/setup';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use('/api/products', productsRoutes);
app.use('/products', productsRoutes);

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'OK', service: 'catalog-service' });
});

setupSwagger(app);

export default app;
