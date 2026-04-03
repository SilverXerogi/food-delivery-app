import type { Request, Response } from 'express';
import type { GetProductsResponse, Product } from '@food-delivery-app/shared-types';
import pool from '../db/pool';

const mapProductRow = (row: any): Product => ({
  id: row.id,
  name: row.name,
  description: row.description,
  price: Number(row.price),
  imageUrl: row.image_url ?? undefined,
  categoryId: row.category_id,
  categoryName: row.category_name,
  categoryKey: row.category_key,
  inStock: row.in_stock,
  weight: row.weight ?? undefined,
});

export const getProducts = async (req: Request, res: Response) => {
  const page = Math.max(Number(req.query.page ?? 1), 1);
  const limit = Math.min(Math.max(Number(req.query.limit ?? 12), 1), 50);
  const offset = (page - 1) * limit;
  const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';
  const categoryId = typeof req.query.categoryId === 'string' ? req.query.categoryId.trim() : '';

  const conditions: string[] = [];
  const params: Array<string | number> = [];

  if (search) {
    params.push(`%${search}%`);
    conditions.push(`(name ILIKE $${params.length} OR description ILIKE $${params.length})`);
  }

  if (categoryId) {
    params.push(categoryId);
    conditions.push(`category_id = $${params.length}`);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  try {
    const dataQuery = `
      SELECT id, name, description, price, image_url, category_id, category_name, category_key, in_stock, weight
      FROM products
      ${whereClause}
      ORDER BY name ASC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;

    const countQuery = `SELECT COUNT(*) AS total FROM products ${whereClause}`;

    const [productsResult, countResult] = await Promise.all([
      pool.query(dataQuery, [...params, limit, offset]),
      pool.query(countQuery, params),
    ]);

    const response: GetProductsResponse = {
      items: productsResult.rows.map(mapProductRow),
      total: Number(countResult.rows[0].total),
      page,
      limit,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Catalog getProducts error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getProductById = async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT id, name, description, price, image_url, category_id, category_name, category_key, in_stock, weight
       FROM products WHERE id = $1`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    return res.status(200).json(mapProductRow(result.rows[0]));
  } catch (error) {
    console.error('Catalog getProductById error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
