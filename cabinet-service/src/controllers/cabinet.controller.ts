import type { Request, Response } from 'express';
import type { CreateOrderRequest, CreateOrderResponse, GetOrdersResponse, Order, OrderItem, UpdateProfileRequest, User } from '@food-delivery-app/shared-types';
import pool from '../db/pool';
import { createOrderSchema, updateProfileSchema } from '../utils/validators';

const mapUserRow = (userRecord: any): User => ({
  id: userRecord.id,
  email: userRecord.email,
  firstName: userRecord.first_name,
  lastName: userRecord.last_name,
  phone: userRecord.phone ?? undefined,
  role: userRecord.role,
  createdAt: userRecord.created_at.toISOString(),
});

const mapOrderRows = (rows: any[]): Order[] => {
  const orderMap = new Map<string, Order>();

  for (const row of rows) {
    if (!orderMap.has(row.order_id)) {
      orderMap.set(row.order_id, {
        id: row.order_id,
        userId: row.user_id,
        totalAmount: Number(row.total_amount),
        deliveryAddress: row.delivery_address,
        status: row.status,
        comment: row.comment ?? undefined,
        createdAt: row.created_at.toISOString(),
        updatedAt: row.updated_at.toISOString(),
        items: [],
      });
    }

    const order = orderMap.get(row.order_id)!;

    if (row.product_id) {
      const item: OrderItem = {
        productId: row.product_id,
        productName: row.product_name,
        price: Number(row.price),
        quantity: row.quantity,
        weight: row.weight ?? undefined,
      };
      order.items.push(item);
    }
  }

  return Array.from(orderMap.values());
};

export const getProfile = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;

  try {
    const result = await pool.query(
      'SELECT id, email, first_name, last_name, phone, role, created_at FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json(mapUserRow(result.rows[0]));
  } catch (error) {
    console.error('Cabinet getProfile error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const { error, value } = updateProfileSchema.validate(req.body, { stripUnknown: true });

  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const payload = value as UpdateProfileRequest;
  const fields: string[] = [];
  const params: Array<string | null> = [];

  if (payload.firstName !== undefined) {
    params.push(payload.firstName.trim());
    fields.push(`first_name = $${params.length}`);
  }
  if (payload.lastName !== undefined) {
    params.push(payload.lastName.trim());
    fields.push(`last_name = $${params.length}`);
  }
  if (payload.phone !== undefined) {
    params.push(payload.phone?.trim() || null);
    fields.push(`phone = $${params.length}`);
  }

  params.push(userId);

  try {
    const result = await pool.query(
      `UPDATE users SET ${fields.join(', ')} WHERE id = $${params.length}
       RETURNING id, email, first_name, last_name, phone, role, created_at`,
      params
    );

    return res.status(200).json(mapUserRow(result.rows[0]));
  } catch (error) {
    console.error('Cabinet updateProfile error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getOrders = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;

  try {
    const result = await pool.query(
      `SELECT
         o.id AS order_id,
         o.user_id,
         o.total_amount,
         o.delivery_address,
         o.status,
         o.comment,
         o.created_at,
         o.updated_at,
         oi.product_id,
         oi.product_name,
         oi.price,
         oi.quantity,
         oi.weight
       FROM orders o
       LEFT JOIN order_items oi ON oi.order_id = o.id
       WHERE o.user_id = $1
       ORDER BY o.created_at DESC, oi.product_name ASC`,
      [userId]
    );

    const orders = mapOrderRows(result.rows);
    const response: GetOrdersResponse = {
      items: orders,
      total: orders.length,
      page: 1,
      limit: orders.length || 10,
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error('Cabinet getOrders error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getOrderById = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;

  try {
    const result = await pool.query(
      `SELECT
         o.id AS order_id,
         o.user_id,
         o.total_amount,
         o.delivery_address,
         o.status,
         o.comment,
         o.created_at,
         o.updated_at,
         oi.product_id,
         oi.product_name,
         oi.price,
         oi.quantity,
         oi.weight
       FROM orders o
       LEFT JOIN order_items oi ON oi.order_id = o.id
       WHERE o.user_id = $1 AND o.id = $2
       ORDER BY oi.product_name ASC`,
      [userId, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    return res.status(200).json(mapOrderRows(result.rows)[0]);
  } catch (error) {
    console.error('Cabinet getOrderById error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const createOrder = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const { error, value } = createOrderSchema.validate(req.body, { stripUnknown: true });

  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const payload = value as CreateOrderRequest;
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const productIds = payload.items.map((item) => item.productId);
    const productsResult = await client.query(
      `SELECT id, name, price, weight, in_stock FROM products WHERE id = ANY($1::uuid[])`,
      [productIds]
    );

    const productsMap = new Map(productsResult.rows.map((row) => [row.id, row]));

    for (const item of payload.items) {
      const product = productsMap.get(item.productId);
      if (!product) {
        throw new Error(`Product not found: ${item.productId}`);
      }
      if (!product.in_stock) {
        throw new Error(`Product is out of stock: ${product.name}`);
      }
    }

    const totalAmount = payload.items.reduce((sum, item) => {
      const product = productsMap.get(item.productId)!;
      return sum + Number(product.price) * item.quantity;
    }, 0);

    const orderResult = await client.query(
      `INSERT INTO orders (user_id, total_amount, delivery_address, status, comment)
       VALUES ($1, $2, $3, 'pending', $4)
       RETURNING id, user_id, total_amount, delivery_address, status, comment, created_at, updated_at`,
      [userId, totalAmount, payload.deliveryAddress.trim(), payload.comment?.trim() || null]
    );

    const order = orderResult.rows[0];

    for (const item of payload.items) {
      const product = productsMap.get(item.productId)!;
      await client.query(
        `INSERT INTO order_items (order_id, product_id, product_name, price, quantity, weight)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [order.id, product.id, product.name, product.price, item.quantity, product.weight ?? null]
      );
    }

    await client.query('COMMIT');

    const fullOrderResult = await pool.query(
      `SELECT
         o.id AS order_id,
         o.user_id,
         o.total_amount,
         o.delivery_address,
         o.status,
         o.comment,
         o.created_at,
         o.updated_at,
         oi.product_id,
         oi.product_name,
         oi.price,
         oi.quantity,
         oi.weight
       FROM orders o
       LEFT JOIN order_items oi ON oi.order_id = o.id
       WHERE o.id = $1
       ORDER BY oi.product_name ASC`,
      [order.id]
    );

    const response: CreateOrderResponse = {
      order: mapOrderRows(fullOrderResult.rows)[0],
    };

    return res.status(201).json(response);
  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error('Cabinet createOrder error:', error);

    const message = typeof error?.message === 'string' ? error.message : 'Internal server error';
    const status = message.startsWith('Product') ? 400 : 500;
    return res.status(status).json({ message });
  } finally {
    client.release();
  }
};
