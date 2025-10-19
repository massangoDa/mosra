import express from 'express';
const router = express.Router();
import { authenticateToken } from '../middleware/auth.js';
import searchController from '../controllers/searchController.js';

router.get('/customer/:customerId/companyName', authenticateToken, searchController.searchCompanyName); // 単
router.get('/customers/transactions', authenticateToken, searchController.searchTransactions); // 複
router.get('/contact/:contactId/lastNameFirstName', authenticateToken, searchController.searchLastNameFirstName); // 単

export default router;