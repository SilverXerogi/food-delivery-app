import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Joi from 'joi';

import {
  User as UserType,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RefreshTokenRequest
} from '@shared/index';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(cors());
app.use(express.json());

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'fallback_access_secret_key_change_me';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret_key_change_me';
const SALT_ROUNDS = 10;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/delivery_db',
});

const generateAccessToken = (user: Omit<UserType, 'password'>) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_ACCESS_SECRET,
    { expiresIn: '15m' }
  );
};

const generateRefreshToken = (userId: string) => {
  return jwt.sign(
    { id: userId },
    JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );
};

const hashPassword = async (password: string): Promise<string> => {
  return await bcrypt.hash(password, SALT_ROUNDS);
};

const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  return await bcrypt.compare(password, hash);
};

const loginSchema = Joi.object<LoginRequest>({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

const registerSchema = Joi.object<RegisterRequest>({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  phone: Joi.string().optional().allow(null, ''),
});

const refreshTokenSchema = Joi.object<RefreshTokenRequest>({
  refreshToken: Joi.string().required(),
});

const authenticateToken = (req: Request, res: Response, next: () => void) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, JWT_ACCESS_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired access token' });
    }
    (req as any).user = decoded;
    next();
  });
};

app.post('/api/auth/login', async (req: Request, res: Response) => {
  const { error, value } = loginSchema.validate(req.body);

  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const { email, password }: LoginRequest = value;

  try {
    const query = 'SELECT id, email, password_hash, first_name, last_name, phone, role, created_at FROM users WHERE email = $1';
    const result = await pool.query(query, [email]);

    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const userRecord = result.rows[0];
    const isValidPassword = await verifyPassword(password, userRecord.password_hash);

    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const userForToken: Omit<UserType, 'password'> = {
      id: userRecord.id,
      email: userRecord.email,
      firstName: userRecord.first_name,
      lastName: userRecord.last_name,
      phone: userRecord.phone,
      role: userRecord.role,
      createdAt: userRecord.created_at.toISOString(),
    };

    const accessToken = generateAccessToken(userForToken);
    const refreshToken = generateRefreshToken(userRecord.id);

    const insertRefreshTokenQuery = 'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, NOW() + INTERVAL \'7 days\') ON CONFLICT (user_id) DO UPDATE SET token = EXCLUDED.token, expires_at = EXCLUDED.expires_at';
    await pool.query(insertRefreshTokenQuery, [userRecord.id, refreshToken]);

    const response: LoginResponse = {
      user: userForToken,
      accessToken,
      refreshToken,
    };

    res.status(200).json(response);
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/api/auth/register', async (req: Request, res: Response) => {
  const { error, value } = registerSchema.validate(req.body);

  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const { email, password, firstName, lastName, phone }: RegisterRequest = value;

  try {
    const checkUserQuery = 'SELECT id FROM users WHERE email = $1';
    const existingUserResult = await pool.query(checkUserQuery, [email]);

    if (existingUserResult.rows.length > 0) {
      return res.status(409).json({ message: 'User already exists' });
    }

    const hashedPassword = await hashPassword(password);

    const insertUserQuery = `
      INSERT INTO users (email, password_hash, first_name, last_name, phone, role)
      VALUES ($1, $2, $3, $4, $5, 'customer')
      RETURNING id, email, first_name, last_name, phone, role, created_at
    `;
    const result = await pool.query(insertUserQuery, [email, hashedPassword, firstName, lastName, phone]);

    const newUserRecord = result.rows[0];
    const userForToken: Omit<UserType, 'password'> = {
      id: newUserRecord.id,
      email: newUserRecord.email,
      firstName: newUserRecord.first_name,
      lastName: newUserRecord.last_name,
      phone: newUserRecord.phone,
      role: newUserRecord.role,
      createdAt: newUserRecord.created_at.toISOString(),
    };

    const accessToken = generateAccessToken(userForToken);
    const refreshToken = generateRefreshToken(newUserRecord.id);

    const insertRefreshTokenQuery = 'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, NOW() + INTERVAL \'7 days\') ON CONFLICT (user_id) DO UPDATE SET token = EXCLUDED.token, expires_at = EXCLUDED.expires_at';
    await pool.query(insertRefreshTokenQuery, [newUserRecord.id, refreshToken]);

    const response: LoginResponse = {
      user: userForToken,
      accessToken,
      refreshToken,
    };

    res.status(201).json(response);
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/api/auth/me', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id; // Получаем из middleware

    const query = 'SELECT id, email, first_name, last_name, phone, role, created_at FROM users WHERE id = $1';
    const result = await pool.query(query, [userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userRecord = result.rows[0];
    const user: Omit<UserType, 'password'> = {
      id: userRecord.id,
      email: userRecord.email,
      firstName: userRecord.first_name,
      lastName: userRecord.last_name,
      phone: userRecord.phone,
      role: userRecord.role,
      createdAt: userRecord.created_at.toISOString(),
    };

    res.status(200).json(user);
  } catch (err) {
    console.error('Get user info error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/api/auth/logout', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    const deleteRefreshTokenQuery = 'DELETE FROM refresh_tokens WHERE user_id = $1';
    await pool.query(deleteRefreshTokenQuery, [userId]);

    res.status(200).json({ message: 'Logged out successfully' });
  } catch (err) {
    console.error('Logout error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/api/auth/refresh', async (req: Request, res: Response) => {
  const { error, value } = refreshTokenSchema.validate(req.body);

  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const { refreshToken }: RefreshTokenRequest = value;

  if (!refreshToken) {
    return res.status(401).json({ message: 'Refresh token required' });
  }

  try {
    const query = 'SELECT user_id FROM refresh_tokens WHERE token = $1 AND expires_at > NOW()';
    const result = await pool.query(query, [refreshToken]);

    if (result.rows.length === 0) {
      return res.status(403).json({ message: 'Invalid or expired refresh token' });
    }

    const userId = result.rows[0].user_id;

    const userQuery = 'SELECT id, email, first_name, last_name, phone, role, created_at FROM users WHERE id = $1';
    const userResult = await pool.query(userQuery, [userId]);

    if (userResult.rows.length === 0) {
      return res.status(403).json({ message: 'User not found' });
    }

    const userRecord = userResult.rows[0];
    const userForToken: Omit<UserType, 'password'> = {
      id: userRecord.id,
      email: userRecord.email,
      firstName: userRecord.first_name,
      lastName: userRecord.last_name,
      phone: userRecord.phone,
      role: userRecord.role,
      createdAt: userRecord.created_at.toISOString(),
    };

    const newAccessToken = generateAccessToken(userForToken);
    const newRefreshToken = generateRefreshToken(userRecord.id);

    const updateRefreshTokenQuery = 'UPDATE refresh_tokens SET token = $1, expires_at = NOW() + INTERVAL \'7 days\' WHERE user_id = $2';
    await pool.query(updateRefreshTokenQuery, [newRefreshToken, userRecord.id]);

    const response: LoginResponse = {
      user: userForToken,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };

    res.status(200).json(response);
  } catch (err) {
    console.error('Refresh token error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Auth service listening on port ${PORT}`);
});