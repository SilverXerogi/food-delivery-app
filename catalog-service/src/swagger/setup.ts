import type { Express, Request, Response } from 'express';
import swaggerUi from 'swagger-ui-express';
import catalogSwaggerSpec from './specs';

export const setupSwagger = (app: Express) => {
  app.get('/docs.json', (_req: Request, res: Response) => {
    res.type('application/json').send(catalogSwaggerSpec);
  });

  app.use(
    '/docs',
    swaggerUi.serve,
    swaggerUi.setup(catalogSwaggerSpec, {
      explorer: true,
      customSiteTitle: 'Food Delivery • Catalog Service API',
    })
  );
};
