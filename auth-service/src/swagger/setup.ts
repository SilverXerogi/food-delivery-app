import type { Express, Request, Response } from 'express';
import swaggerUi from 'swagger-ui-express';
import authSwaggerSpec from './specs';

export const setupSwagger = (app: Express) => {
  app.get('/docs.json', (_req: Request, res: Response) => {
    res.type('application/json').send(authSwaggerSpec);
  });

  app.use(
    '/docs',
    swaggerUi.serve,
    swaggerUi.setup(authSwaggerSpec, {
      explorer: true,
      customSiteTitle: 'Food Delivery • Auth Service API',
    })
  );
};
