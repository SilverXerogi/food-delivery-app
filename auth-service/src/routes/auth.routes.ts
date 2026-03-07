// src/routes/auth.routes.ts
import { Router } from 'express';
import { authenticateToken } from '../middlewares/auth';
import * as authController from '../controllers/auth.controller';

const router = Router();

router.post('/login', authController.login);
router.post('/register', authController.register);
router.post('/refresh', authController.refreshToken);

// Protected routes
router.get('/me', authenticateToken, authController.getCurrentUser);
router.post('/logout', authenticateToken, authController.logout);

export default router;