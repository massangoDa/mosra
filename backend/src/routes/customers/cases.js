import express from 'express';
const router = express.Router({ mergeParams: true });
import { authenticateToken } from '../../middleware/auth.js';
import casesController from "../../controllers/casesController.js";
import invoicesController from "../../controllers/cases/invoicesController.js";
import transactionsController from "../../controllers/cases/transactionsController.js"

router.post('/', authenticateToken, casesController.createCase); // 単
router.get('/', authenticateToken, casesController.getCases); // 複
router.get('/:caseId', authenticateToken, casesController.getCase) // 単
router.put('/:caseId', authenticateToken, casesController.updateCase) // 単
router.delete('/:caseId', authenticateToken, casesController.deleteCase) // 単
router.post('/:caseId/invoices/', authenticateToken, invoicesController.createInvoice) // 単
router.get('/:caseId/invoices/', authenticateToken, invoicesController.getInvoices) // 複
router.get('/:caseId/invoices/:invoiceId/', authenticateToken, invoicesController.getInvoice) // 単
router.post('/:caseId/invoices/:invoiceId/transactions/', authenticateToken, transactionsController.createTransaction) // 単
router.get('/:caseId/invoices/:invoiceId/transactions/', authenticateToken, transactionsController.getTransactions) // 複
router.put('/:caseId/invoices/:invoiceId/transactions/:transactionId/', authenticateToken, transactionsController.updateTransaction) // 単

export default router;