import { Request, Response } from 'express';
import pool from '../db/pool';
import { hashPassword, verifyPassword } from '../utils/password';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt';
import { loginSchema, registerSchema, refreshTokenSchema } from '../utils/validators';
import type { User, LoginResponse } from '@food-delivery-app/shared-types';

const mapUserRow = (userRecord: any): Omit<User, 'password'> => ({
  id: userRecord.id,
  email: userRecord.email,
  firstName: userRecord.first_name,
  lastName: userRecord.last_name,
  phone: userRecord.phone,
  role: userRecord.role,
  createdAt: userRecord.created_at.toISOString(),
});


const saveRefreshToken = async (userId: string, refreshToken: string) => {
  await pool.query('DELETE FROM refresh_tokens WHERE user_id = $1', [userId]);
  await pool.query(
    `INSERT INTO refresh_tokens (user_id, token, expires_at)
     VALUES ($1, $2, NOW() + INTERVAL '7 days')`,
    [userId, refreshToken]
  );
};

export const login = async (req: Request, res: Response) => {
  const { error, value } = loginSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const email = value.email.trim().toLowerCase();
  const { password } = value;

  try {
    const result = await pool.query(
      'SELECT id, email, password_hash, first_name, last_name, phone, role, created_at FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const userRecord = result.rows[0];
    const isValidPassword = await verifyPassword(password, userRecord.password_hash);

    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const userForToken = mapUserRow(userRecord);
    const accessToken = generateAccessToken(userForToken);
    const refreshToken = generateRefreshToken(userRecord.id);

    await saveRefreshToken(userRecord.id, refreshToken);

    const response: LoginResponse = {
      user: userForToken,
      accessToken,
      refreshToken,
    };

    return res.status(200).json(response);
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const register = async (req: Request, res: Response) => {
  const { error, value } = registerSchema.validate(req.body, { stripUnknown: true });
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const email = value.email.trim().toLowerCase();
  const { password, firstName, lastName, phone } = value;

  try {
    const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(409).json({ message: 'User already exists' });
    }

    const hashedPassword = await hashPassword(password);

    const result = await pool.query(
      `INSERT INTO users (email, password_hash, first_name, last_name, phone, role)
       VALUES ($1, $2, $3, $4, $5, 'customer')
       RETURNING id, email, first_name, last_name, phone, role, created_at`,
      [email, hashedPassword, firstName.trim(), lastName.trim(), phone?.trim() || null]
    );

    const newUser = result.rows[0];
    const userForToken = mapUserRow(newUser);
    const accessToken = generateAccessToken(userForToken);
    const refreshToken = generateRefreshToken(newUser.id);

    await saveRefreshToken(newUser.id, refreshToken);

    const response: LoginResponse = {
      user: userForToken,
      accessToken,
      refreshToken,
    };

    return res.status(201).json(response);
  } catch (err: any) {
    console.error('Register error:', err);

    if (err?.code === '23505') {
      return res.status(409).json({ message: 'User already exists' });
    }

    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getCurrentUser = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;

  try {
    const result = await pool.query(
      'SELECT id, email, first_name, last_name, phone, role, created_at FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = mapUserRow(result.rows[0]);
    return res.status(200).json(user);
  } catch (err) {
    console.error('Get user info error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const logout = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;

  try {
    await pool.query('DELETE FROM refresh_tokens WHERE user_id = $1', [userId]);
    return res.status(200).json({ message: 'Logged out successfully' });
  } catch (err) {
    console.error('Logout error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  const { error, value } = refreshTokenSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const { refreshToken } = value;

  try {
    const result = await pool.query(
      'SELECT user_id FROM refresh_tokens WHERE token = $1 AND expires_at > NOW()',
      [refreshToken]
    );

    if (result.rows.length === 0) {
      return res.status(403).json({ message: 'Invalid or expired refresh token' });
    }

    const userId = result.rows[0].user_id;
    const userResult = await pool.query(
      'SELECT id, email, first_name, last_name, phone, role, created_at FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(403).json({ message: 'User not found' });
    }

    const userForToken = mapUserRow(userResult.rows[0]);
    const newAccessToken = generateAccessToken(userForToken);
    const newRefreshToken = generateRefreshToken(userId);

    await saveRefreshToken(userId, newRefreshToken);

    const response: LoginResponse = {
      user: userForToken,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };

    return res.status(200).json(response);
  } catch (err) {
    console.error('Refresh token error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
