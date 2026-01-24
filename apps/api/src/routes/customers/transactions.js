import express from 'express';
const router = express.Router({ mergeParams: true });
import { authenticateToken } from '../../middleware/auth.js';
import transactionsController from '../../controllers/cases/transactionsController.js';

router.get('/', authenticateToken, transactionsController.getTransactions); // 複
router.post('/', authenticateToken, transactionsController.createTransaction); // 単

export default router;