// src/routes/auth.routes.ts
import { Router } from 'express';
import { authenticateToken } from '../middlewares/auth';
import * as authController from '../controllers/auth.controller';

const router = Router();

// Эти роуты будут доступны как:
// POST http://localhost:3001/auth/login
// POST http:// localhost:3001/auth/register
// GET  http:// localhost:3001/auth/me (с токеном)
// POST http:// localhost:3001/auth/logout (с токеном)
// POST http:// localhost:3001/auth/refresh
router.post('/login', authController.login);
router.post('/register', authController.register);
router.post('/refresh', authController.refreshToken);

// Protected routes
router.get('/me', authenticateToken, authController.getCurrentUser);
router.post('/logout', authenticateToken, authController.logout);

export default router;