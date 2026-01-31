import express from 'express';
const router = express.Router({ mergeParams: true });
import { authenticateToken } from '../../middleware/auth.js';
import customersController from '../../controllers/customersController.js';
import casesRoutes from './cases.js';
import transactionsRoutes from './transactions.js';
import invoicesRoutes from './invoices.js';
import commentsRoutes from './comments.js';

// customers/
router.get('/', authenticateToken, customersController.getCustomers); // 複
router.post('/', authenticateToken, customersController.createCustomer); // 単
router.get('/:customerId',authenticateToken, customersController.getCustomer) // 単
router.put('/:customerId', authenticateToken, customersController.updateCustomer) // 単
router.delete('/:customerId', authenticateToken, customersController.deleteCustomer) // 単

// ネスト
router.use("/:customerId/cases", casesRoutes);
router.use("/:customerId/transactions", transactionsRoutes);
router.use("/:customerId/invoices", invoicesRoutes);
router.use("/:customerId/comments", commentsRoutes);

export default router;