import express from 'express';
const router = express.Router({ mergeParams: true });
import { authenticateToken } from '../middleware/auth.middleware.js';
import * as customersController from '../controllers/customer.controller.js';

router.get('/', authenticateToken, customersController.getCustomers);
router.post('/', authenticateToken, customersController.createCustomer);
router.put('/:customerId', authenticateToken, customersController.updateCustomer);

export default router;