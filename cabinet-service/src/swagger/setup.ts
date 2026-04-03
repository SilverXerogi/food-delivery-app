import type { Express, Request, Response } from 'express';
import swaggerUi from 'swagger-ui-express';
import cabinetSwaggerSpec from './specs';

export const setupSwagger = (app: Express) => {
  app.get('/docs.json', (_req: Request, res: Response) => {
    res.type('application/json').send(cabinetSwaggerSpec);
  });

  app.use(
    '/docs',
    swaggerUi.serve,
    swaggerUi.setup(cabinetSwaggerSpec, {
      explorer: true,
      customSiteTitle: 'Food Delivery • Cabinet Service API',
    })
  );
};
