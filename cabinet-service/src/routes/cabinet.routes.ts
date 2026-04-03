import { Router } from 'express';
import { authenticateToken } from '../middlewares/auth';
import { createOrder, getOrderById, getOrders, getProfile, updateProfile } from '../controllers/cabinet.controller';

const router = Router();

router.use(authenticateToken);
router.get('/profile', getProfile);
router.patch('/profile', updateProfile);
router.get('/orders', getOrders);
router.post('/orders', createOrder);
router.get('/orders/:id', getOrderById);

export default router;
