import { Request, Response, NextFunction } from 'express'; // FIX: Добавлен NextFunction
import { verifyAccessToken } from '../utils/jwt';

export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction // FIX: Добавлен тип NextFunction
) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  try {
    const decoded = verifyAccessToken(token); // FIX: Теперь использует правильную функцию
    (req as any).user = decoded;
    next(); // FIX: Добавлен вызов next()
  } catch (err) {
    return res.status(403).json({ message: 'Invalid or expired access token' });
  }
};