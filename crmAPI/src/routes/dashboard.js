import express from 'express';
const router = express.Router();
import { authenticateToken } from '../middleware/auth.js';
import dashboardController from '../controllers/dashboardController.js';

router.get('/', authenticateToken, dashboardController.getDashboard);
router.get('/monthly-sales', authenticateToken, dashboardController.getMonthlySales);
router.get('/unpaid-invoices', authenticateToken, dashboardController.getUnpaidInvoices);

export default router;